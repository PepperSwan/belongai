-- Add columns to store structured demographic data in breaking_barriers_results
ALTER TABLE breaking_barriers_results
ADD COLUMN age_range text,
ADD COLUMN gender text,
ADD COLUMN ethnicity text[],
ADD COLUMN sexuality text,
ADD COLUMN disability_status text,
ADD COLUMN disability_details text,
ADD COLUMN neurodiversity_status text,
ADD COLUMN neurodiversity_details text,
ADD COLUMN parent_occupation_age14 text,
ADD COLUMN childhood_hobbies text[],
ADD COLUMN household_income_age14 text,
ADD COLUMN family_university boolean,
ADD COLUMN location_grew_up text,
ADD COLUMN additional_info text;