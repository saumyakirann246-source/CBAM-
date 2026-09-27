-- ============================================================
-- CBAM Exporter Tracker — Database Schema (PostgreSQL / Supabase)
-- ============================================================
-- Canonical Version 2 (Sector-Aware & Data Confidence Tiered)
-- Multi-tenant org/division structure, CN codes, emission factors,
-- markup/free-allocation schedules, products, installations,
-- production data, buyers, documents, tasks, notifications.
-- ============================================================

-- ---------- Multi-tenant structure ----------

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists divisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  country text,               -- ISO 3166-1 alpha-2 of the division/plant's home country
  primary_sector text check (primary_sector in ('iron_steel','aluminium','cement','fertiliser','hydrogen','electricity')),
  created_at timestamptz default now()
);
create index if not exists idx_divisions_org on divisions(organization_id);

-- auth.users (Supabase) mapped to a division-scoped role
create table if not exists division_members (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','compliance_officer','viewer')),
  created_at timestamptz default now(),
  unique(division_id, user_id)
);

-- ---------- Reference data (regulatory numbers) ----------

-- CN code reference (product classification -> sector)
create table if not exists cn_codes (
  code text primary key,          -- e.g. '7208', '2523', '7601'
  description text not null,
  sector text not null check (sector in ('iron_steel','aluminium','cement','fertiliser','hydrogen','electricity')),
  is_complex_good boolean default false  -- true if this good embeds CBAM precursor materials
);

-- Default embedded-emissions values by CN code and applicable period
create table if not exists default_emission_factors (
  id uuid primary key default gen_random_uuid(),
  cn_code text references cn_codes(code),
  production_route text,           -- e.g. 'BF-BOF', 'DRI-EAF', 'scrap-EAF' for steel
  country_of_origin text,          -- ISO 3166-1 alpha-2, null = generic/non-country-specific value
  applicable_from date not null,
  direct_emissions_t_co2_per_t numeric(10,4) not null,
  indirect_emissions_t_co2_per_t numeric(10,4),
  -- 'fake_placeholder'   = dummy (e.g. 9.9999), not real
  -- 'secondary_sourced'  = real published figure via secondary industry guidance citing IR 2025/2621
  -- 'primary_verified'   = checked directly against official corrected IR 2026/1740 Annex I file
  data_confidence text not null default 'fake_placeholder' check (data_confidence in ('fake_placeholder','secondary_sourced','primary_verified')),
  source_url text,
  last_verified_date date,
  unique(cn_code, production_route, country_of_origin, applicable_from)
);

-- Default-value markup schedule (sector-aware: fertiliser is 1.01; steel/cement/aluminium/hydrogen are 1.10/1.20/1.30)
create table if not exists default_value_markup_schedule (
  id uuid primary key default gen_random_uuid(),
  sector text not null check (sector in ('iron_steel','aluminium','cement','fertiliser','hydrogen','electricity')),
  year int not null,
  markup_multiplier numeric(4,3) not null,
  source_url text,
  last_verified_date date,
  unique(sector, year)
);

-- Free-allocation phase-out schedule (full 2026–2034 ramp)
create table if not exists free_allocation_schedule (
  year int primary key,
  liability_percentage numeric(5,4) not null,
  source_url text,
  last_verified_date date
);

-- ETS price time series, feeds cost-exposure estimates
create table if not exists ets_prices (
  id uuid primary key default gen_random_uuid(),
  price_date date not null unique,
  price_eur_per_tonne numeric(10,2) not null,
  source text
);

-- Whether a sector's indirect emissions are exempt from CBAM cost exposure
create table if not exists sector_indirect_exemptions (
  sector text primary key,
  indirect_exempt boolean not null,
  notes text,
  source_url text,
  last_verified_date date
);

-- ---------- User-facing data ----------

create table if not exists installations (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  name text not null,
  country text not null,
  production_route text,
  monitoring_methodology_notes text,
  created_at timestamptz default now()
);
create index if not exists idx_installations_division on installations(division_id);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  installation_id uuid references installations(id),
  label text not null,
  cn_code text references cn_codes(code),
  created_at timestamptz default now()
);
create index if not exists idx_products_division on products(division_id);

create table if not exists eu_buyers (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  company_name text not null,
  eori_number text,             -- needed for O3CI data retrieval on their end
  country text,
  contact_name text,
  contact_email text,
  preferred_format text check (preferred_format in ('pdf','o3ci_reference','both')),
  reporting_cadence text,       -- e.g. 'quarterly'
  status text default 'active' check (status in ('active','dormant','new')),
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_eu_buyers_division on eu_buyers(division_id);

create table if not exists production_data (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  reporting_period_start date not null,
  reporting_period_end date not null,
  quantity_produced_t numeric(14,3) not null check (quantity_produced_t >= 0),
  electricity_consumed_mwh numeric(14,3),
  fuel_consumed jsonb,
  uses_actual_data boolean not null default false,  -- false = falls back to default_emission_factors
  calculated_direct_emissions_t numeric(14,3),
  calculated_indirect_emissions_t numeric(14,3),
  calculated_at timestamptz,
  created_at timestamptz default now(),
  unique(product_id, reporting_period_start, reporting_period_end)
);
create index if not exists idx_production_data_product on production_data(product_id);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  product_id uuid references products(id),
  production_data_id uuid references production_data(id),
  document_type text check (document_type in ('energy_bill','meter_reading','verifier_report','methodology_doc','other')),
  file_path text not null,   -- Supabase Storage path
  uploaded_by uuid references auth.users(id),
  retention_expires_on date,  -- uploaded_at + 5 years, per CBAM's retention requirement
  created_at timestamptz default now()
);
create index if not exists idx_documents_division on documents(division_id);

create table if not exists data_shares (
  id uuid primary key default gen_random_uuid(),
  eu_buyer_id uuid references eu_buyers(id) on delete cascade,
  reporting_period_start date not null,
  reporting_period_end date not null,
  product_ids uuid[] not null,
  output_format text check (output_format in ('pdf_communication_sheet','o3ci_submission_package')),
  file_path text,          -- generated file in Supabase Storage
  status text default 'draft' check (status in ('draft','shared','acknowledged')),
  shared_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_data_shares_buyer on data_shares(eu_buyer_id);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references divisions(id) on delete cascade,
  title text not null,
  assigned_to uuid references auth.users(id),
  due_date date,
  status text default 'open' check (status in ('open','in_progress','done')),
  related_eu_buyer_id uuid references eu_buyers(id),
  created_at timestamptz default now()
);
create index if not exists idx_tasks_division on tasks(division_id);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('deadline','buyer_request','verification_update','regulatory_update','task_assigned')),
  message text not null,
  link_path text,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifications_user on notifications(user_id);

-- ---------- Row Level Security ----------

alter table organizations enable row level security;
drop policy if exists "member orgs" on organizations;
create policy "member orgs" on organizations for all using (
  id in (select d.organization_id from divisions d join division_members dm on dm.division_id = d.id where dm.user_id = auth.uid())
);

alter table divisions enable row level security;
drop policy if exists "member divisions" on divisions;
create policy "member divisions" on divisions for all using (
  id in (select division_id from division_members where user_id = auth.uid())
);

alter table division_members enable row level security;
drop policy if exists "own membership rows" on division_members;
create policy "own membership rows" on division_members for select using (
  division_id in (select division_id from division_members where user_id = auth.uid())
);

alter table installations enable row level security;
drop policy if exists "division installations" on installations;
create policy "division installations" on installations for all using (
  division_id in (select division_id from division_members where user_id = auth.uid())
);

alter table products enable row level security;
drop policy if exists "division products" on products;
create policy "division products" on products for all using (
  division_id in (select division_id from division_members where user_id = auth.uid())
);

alter table eu_buyers enable row level security;
drop policy if exists "division buyers" on eu_buyers;
create policy "division buyers" on eu_buyers for all using (
  division_id in (select division_id from division_members where user_id = auth.uid())
);

alter table production_data enable row level security;
drop policy if exists "division production data" on production_data;
create policy "division production data" on production_data for all using (
  product_id in (select id from products where division_id in (select division_id from division_members where user_id = auth.uid()))
);

alter table documents enable row level security;
drop policy if exists "division documents" on documents;
create policy "division documents" on documents for all using (
  division_id in (select division_id from division_members where user_id = auth.uid())
);

alter table data_shares enable row level security;
drop policy if exists "division data shares" on data_shares;
create policy "division data shares" on data_shares for all using (
  eu_buyer_id in (select id from eu_buyers where division_id in (select division_id from division_members where user_id = auth.uid()))
);

alter table tasks enable row level security;
drop policy if exists "division tasks" on tasks;
create policy "division tasks" on tasks for all using (
  division_id in (select division_id from division_members where user_id = auth.uid())
);

alter table notifications enable row level security;
drop policy if exists "own notifications" on notifications;
create policy "own notifications" on notifications for all using (auth.uid() = user_id);

-- Reference tables: public read
alter table cn_codes enable row level security;
drop policy if exists "public read cn_codes" on cn_codes;
create policy "public read cn_codes" on cn_codes for select using (true);

alter table default_emission_factors enable row level security;
drop policy if exists "public read emission factors" on default_emission_factors;
create policy "public read emission factors" on default_emission_factors for select using (true);

alter table default_value_markup_schedule enable row level security;
drop policy if exists "public read markup schedule" on default_value_markup_schedule;
create policy "public read markup schedule" on default_value_markup_schedule for select using (true);

alter table free_allocation_schedule enable row level security;
drop policy if exists "public read free allocation schedule" on free_allocation_schedule;
create policy "public read free allocation schedule" on free_allocation_schedule for select using (true);

alter table ets_prices enable row level security;
drop policy if exists "public read ets prices" on ets_prices;
create policy "public read ets prices" on ets_prices for select using (true);

alter table sector_indirect_exemptions enable row level security;
drop policy if exists "public read sector exemptions" on sector_indirect_exemptions;
create policy "public read sector exemptions" on sector_indirect_exemptions for select using (true);
