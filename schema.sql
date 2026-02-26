-- Rice Plant Monitoring System - PostgreSQL Schema
-- Run this against your rice_monitoring database: psql -U your_username -d rice_monitoring -f schema.sql

CREATE TABLE IF NOT EXISTS plant_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_data text NOT NULL,
  captured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plant_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid NOT NULL REFERENCES plant_images(id) ON DELETE CASCADE,
  health_status text NOT NULL,
  health_score integer NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  green_percentage numeric NOT NULL DEFAULT 0,
  yellow_percentage numeric NOT NULL DEFAULT 0,
  brown_percentage numeric NOT NULL DEFAULT 0,
  harvest_ready boolean DEFAULT false,
  recommendations text,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plant_images_captured_at ON plant_images(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_plant_analysis_image_id ON plant_analysis(image_id);
CREATE INDEX IF NOT EXISTS idx_plant_analysis_analyzed_at ON plant_analysis(analyzed_at DESC);
