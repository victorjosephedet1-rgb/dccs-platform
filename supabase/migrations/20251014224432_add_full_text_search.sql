/*
  # Add Full-Text Search to Audio Snippets

  ## Overview
  Adds PostgreSQL full-text search capabilities to the audio_snippets table
  for fast, intelligent searching across multiple fields.

  ## Changes
  1. New Columns
    - `search_vector` (tsvector) - Automatically updated search data
      - Title: Weight 'A' (highest priority)
      - Artist: Weight 'B' (high priority)
      - Description: Weight 'C' (medium priority)
      - Tags: Weight 'D' (lower priority)

  2. Indexes
    - GIN index on search_vector for optimal full-text search performance

  3. Triggers
    - Auto-update search_vector on insert/update

  ## Benefits
  - Lightning-fast search across all text fields
  - Weighted results (title matches rank higher than tag matches)
  - Supports complex queries with AND/OR operators
  - Handles stemming (searching "running" matches "run")
  - Case-insensitive by default

  ## Usage Example
  ```sql
  SELECT * FROM audio_snippets
  WHERE search_vector @@ to_tsquery('english', 'electronic & upbeat')
  ORDER BY ts_rank(search_vector, to_tsquery('english', 'electronic & upbeat')) DESC;
  ```
*/

-- Add search_vector column
ALTER TABLE audio_snippets 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_audio_snippets_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.artist, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector on insert/update
DROP TRIGGER IF EXISTS update_audio_snippets_search_vector_trigger ON audio_snippets;
CREATE TRIGGER update_audio_snippets_search_vector_trigger
  BEFORE INSERT OR UPDATE ON audio_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_audio_snippets_search_vector();

-- Update existing rows
UPDATE audio_snippets SET search_vector = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(artist, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D')
WHERE search_vector IS NULL;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS audio_snippets_search_idx 
ON audio_snippets USING GIN (search_vector);
