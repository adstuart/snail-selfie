-- Database schema for Snail Tracker app
-- Run this in your Vercel Postgres database

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Snails table
CREATE TABLE IF NOT EXISTS snails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  species_tag VARCHAR(255) DEFAULT 'Garden snail',
  approx_age VARCHAR(50),
  age_explanation TEXT,
  age_confidence VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Snail images table (reference images)
CREATE TABLE IF NOT EXISTS snail_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snail_id UUID REFERENCES snails(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  embedding VECTOR(1536),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sightings table
CREATE TABLE IF NOT EXISTS sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snail_id UUID REFERENCES snails(id) ON DELETE CASCADE,
  garden_location VARCHAR(50) NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Sighting images table
CREATE TABLE IF NOT EXISTS sighting_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id UUID REFERENCES sightings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_snail_images_snail_id ON snail_images(snail_id);
CREATE INDEX IF NOT EXISTS idx_sightings_snail_id ON sightings(snail_id);
CREATE INDEX IF NOT EXISTS idx_sighting_images_sighting_id ON sighting_images(sighting_id);
CREATE INDEX IF NOT EXISTS idx_sightings_timestamp ON sightings(timestamp DESC);
