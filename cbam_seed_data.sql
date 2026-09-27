-- ============================================================
-- Seed data — Canonical Updated Pass
-- ============================================================
-- Confidence Tiers:
--   'primary_verified'   - checked against official IR 2026/1740
--   'secondary_sourced'  - sourced from industry guidance citing IR 2025/2621
--   'fake_placeholder'   - dummy (9.9999), not real
-- ============================================================

-- ---------- CN code sectors (starter set) ----------
insert into cn_codes (code, description, sector, is_complex_good) values
  ('7208', 'Flat-rolled products of iron/non-alloy steel, hot-rolled', 'iron_steel', false),
  ('7213', 'Bars and rods, hot-rolled, of iron/non-alloy steel', 'iron_steel', false),
  ('7306', 'Other tubes/pipes of iron or steel', 'iron_steel', true),
  ('7601', 'Unwrought aluminium', 'aluminium', false),
  ('7604', 'Aluminium bars, rods, and profiles', 'aluminium', true),
  ('2523', 'Portland cement and other hydraulic cements', 'cement', false),
  ('2814', 'Ammonia, anhydrous or in aqueous solution', 'fertiliser', false),
  ('3102', 'Nitrogenous mineral or chemical fertilisers', 'fertiliser', true),
  ('280410', 'Hydrogen', 'hydrogen', false),
  ('2716', 'Electrical energy', 'electricity', false)
on conflict (code) do nothing;

-- ---------- SOURCED: default-value markup schedule (sector-aware) ----------
insert into default_value_markup_schedule (sector, year, markup_multiplier, source_url, last_verified_date) values
  ('iron_steel', 2026, 1.10, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('iron_steel', 2027, 1.20, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('iron_steel', 2028, 1.30, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('cement', 2026, 1.10, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('cement', 2027, 1.20, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('cement', 2028, 1.30, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('aluminium', 2026, 1.10, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('aluminium', 2027, 1.20, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('aluminium', 2028, 1.30, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('hydrogen', 2026, 1.10, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('hydrogen', 2027, 1.20, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('hydrogen', 2028, 1.30, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('fertiliser', 2026, 1.01, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('fertiliser', 2027, 1.01, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27'),
  ('fertiliser', 2028, 1.01, 'https://cbamguide.com/learn/eu-cbam/', '2026-09-27')
on conflict (sector, year) do update
set markup_multiplier = excluded.markup_multiplier, source_url = excluded.source_url, last_verified_date = excluded.last_verified_date;

-- ---------- SOURCED: free allocation phase-out (full 2026–2034 ramp) ----------
insert into free_allocation_schedule (year, liability_percentage, source_url, last_verified_date) values
  (2026, 0.0250, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2027, 0.0500, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2028, 0.1000, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2029, 0.2250, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2030, 0.4850, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2031, 0.6100, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2032, 0.7350, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2033, 0.8600, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27'),
  (2034, 1.0000, 'https://www.ey.com/en_gl/technical/tax-alerts/final-regulations-published-for-new-eu-carbon-border-adjustment-', '2026-09-27')
on conflict (year) do update
set liability_percentage = excluded.liability_percentage, source_url = excluded.source_url, last_verified_date = excluded.last_verified_date;

-- ---------- SOURCED: sector indirect-emission exemptions ----------
insert into sector_indirect_exemptions (sector, indirect_exempt, notes, source_url, last_verified_date) values
  ('iron_steel', true, 'Indirect emissions exempt per Annex II for CN 72xx.', 'https://cbamtrack.com', '2026-09-27'),
  ('aluminium', true, 'Indirect emissions exempt per Annex II — only direct emissions and PFCs are priced, not electricity.', 'https://cbamguide.com/exporters/aluminium/', '2026-09-27'),
  ('cement', false, 'Indirect emissions ARE currently required for cement.', 'https://co2-iq.com/en/eu-cbam-default-values-emissions', '2026-09-27'),
  ('fertiliser', false, 'Indirect emissions ARE currently required for fertiliser.', 'https://co2-iq.com/en/eu-cbam-default-values-emissions', '2026-09-27'),
  ('hydrogen', true, 'Indirect emissions currently exempt for hydrogen.', 'https://co2-iq.com/en/eu-cbam-default-values-emissions', '2026-09-27'),
  ('electricity', true, 'Electricity uses dedicated grid-factor methodology.', 'https://co2-iq.com/en/eu-cbam-default-values-emissions', '2026-09-27')
on conflict (sector) do update
set indirect_exempt = excluded.indirect_exempt, notes = excluded.notes, source_url = excluded.source_url, last_verified_date = excluded.last_verified_date;

-- ---------- SOURCED (secondary): example default/benchmark emission values ----------
insert into default_emission_factors (cn_code, production_route, country_of_origin, applicable_from, direct_emissions_t_co2_per_t, indirect_emissions_t_co2_per_t, data_confidence, source_url, last_verified_date) values
  ('7208', 'BF-BOF', NULL, '2026-01-01', 1.370, NULL, 'secondary_sourced', 'https://cbamguide.com/sectors/steel/benchmarks/', '2026-09-27'),
  ('7208', 'DRI-EAF', NULL, '2026-01-01', 0.481, NULL, 'secondary_sourced', 'https://cbamguide.com/sectors/steel/benchmarks/', '2026-09-27'),
  ('7208', 'scrap-EAF', NULL, '2026-01-01', 0.072, NULL, 'secondary_sourced', 'https://cbamguide.com/sectors/steel/benchmarks/', '2026-09-27'),
  ('7208', 'BF-BOF', 'CN', '2026-01-01', 3.167, NULL, 'secondary_sourced', 'https://cbamguide.com/countries/china/', '2026-09-27'),
  ('7601', NULL, NULL, '2026-01-01', 2.500, NULL, 'secondary_sourced', 'https://cbamguide.com/exporters/aluminium/', '2026-09-27'),
  ('2523', NULL, 'TR', '2026-01-01', 1.584, 1.584, 'secondary_sourced', 'https://cbamguide.com/learn/sectors/', '2026-09-27'),
  ('7208', 'scrap-recycled', NULL, '2026-01-01', 0.000, NULL, 'secondary_sourced', 'https://cbamguide.com/learn/sectors/', '2026-09-27')
on conflict (cn_code, production_route, country_of_origin, applicable_from) do nothing;

-- Placeholder dummy rows for remaining sectors
insert into default_emission_factors (cn_code, production_route, country_of_origin, applicable_from, direct_emissions_t_co2_per_t, indirect_emissions_t_co2_per_t, data_confidence) values
  ('3102', NULL, NULL, '2026-01-01', 9.9999, 9.9999, 'fake_placeholder'),
  ('2814', NULL, NULL, '2026-01-01', 9.9999, 9.9999, 'fake_placeholder'),
  ('280410', NULL, NULL, '2026-01-01', 9.9999, 9.9999, 'fake_placeholder'),
  ('2716', NULL, NULL, '2026-01-01', 9.9999, NULL, 'fake_placeholder')
on conflict (cn_code, production_route, country_of_origin, applicable_from) do nothing;

-- ---------- SOURCED: Real historical ETS auction price points ----------
insert into ets_prices (price_date, price_eur_per_tonne, source) values
  ('2026-01-01', 75.36, 'Q1 2026 quarterly average EU ETS auction clearing price'),
  ('2026-04-01', 75.28, 'Q2 2026 quarterly average EU ETS auction clearing price')
on conflict (price_date) do nothing;
