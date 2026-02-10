-- RecycleHub Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. MATERIALS TABLE
-- Stores material composition and carbon data
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
  id BIGSERIAL PRIMARY KEY,
  material_name VARCHAR(100) NOT NULL,
  material_type VARCHAR(50) NOT NULL, -- 'plastic', 'metal', 'glass', 'paper', 'ewaste', etc.
  carbon_new DECIMAL(5,2) NOT NULL, -- CO2 emissions for new product (kg)
  carbon_recycled DECIMAL(5,2) NOT NULL, -- CO2 emissions for recycled product (kg)
  water_saved DECIMAL(5,2) NOT NULL, -- Water saved when recycled (L)
  energy_saved DECIMAL(5,2) NOT NULL, -- Energy saved when recycled (kWh)
  recyclable_status VARCHAR(20) NOT NULL DEFAULT 'fully', -- 'fully', 'partially', 'no'
  recycling_tips TEXT[], -- Array of recycling tips
  icon VARCHAR(10) DEFAULT '♻️',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default materials data
INSERT INTO materials (material_name, material_type, carbon_new, carbon_recycled, water_saved, energy_saved, recyclable_status, recycling_tips, icon) VALUES
('Plastic (PET)', 'plastic', 2.5, 1.4, 18, 0.6, 'fully', ARRAY['Rinse before recycling', 'Remove the cap', 'Crush to save space'], '♻️'),
('Plastic (HDPE)', 'plastic', 2.0, 1.2, 15, 0.5, 'fully', ARRAY['Rinse thoroughly', 'Keep cap on'], '♻️'),
('Cardboard', 'paper', 1.5, 0.5, 15, 1.2, 'fully', ARRAY['Flatten the box', 'Remove plastic tape', 'Keep dry'], '📦'),
('Paper', 'paper', 1.2, 0.4, 12, 0.9, 'fully', ARRAY['Remove staples', 'Keep dry', 'Flatten'], '📄'),
('Glass', 'glass', 1.8, 0.5, 25, 1.5, 'fully', ARRAY['Rinse thoroughly', 'Remove lids', 'Separate by color'], '🫙'),
('Aluminum', 'metal', 8.5, 1.2, 8, 2.5, 'fully', ARRAY['Rinse and crush', 'Keep intact'], '🥫'),
('Steel', 'metal', 3.5, 1.0, 10, 1.8, 'fully', ARRAY['Rinse thoroughly', 'Remove labels'], '🔩'),
('E-waste', 'ewaste', 5.0, 3.5, 5, 0.5, 'partially', ARRAY['Do not disassemble', 'Take to authorized center', 'Remove batteries'], '📱'),
('Batteries', 'ewaste', 2.0, 1.3, 8, 0.6, 'partially', ARRAY['Do not dispose in trash', 'Take to collection point'], '🔋'),
('Plastic Bag', 'plastic', 3.0, 3.0, 0, 0, 'no', ARRAY['Reuse as much as possible', 'Check store drop-off programs'], '❌'),
('Styrofoam', 'plastic', 5.0, 5.0, 0, 0, 'no', ARRAY['Very difficult to recycle', 'Try to avoid use'], '❌')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. SCANNED ITEMS TABLE
-- Stores user's scanned items
-- ============================================
CREATE TABLE IF NOT EXISTS scanned_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  material_type VARCHAR(50) REFERENCES materials(material_type),
  material_id BIGINT REFERENCES materials(id),
  recyclable_status VARCHAR(20) NOT NULL,
  carbon_saved_percent DECIMAL(5,2),
  carbon_saved_kg DECIMAL(5,2),
  water_saved_l DECIMAL(5,2),
  energy_saved_kwh DECIMAL(5,2),
  image_url TEXT,
  action_taken VARCHAR(50), -- 'recycled', 'drop_off', 'pickup', 'none'
  recycling_tips TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE scanned_items ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own data
CREATE POLICY "Users can view own scanned items" ON scanned_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scanned items" ON scanned_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scanned items" ON scanned_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scanned items" ON scanned_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. USER IMPACT TABLE
-- Tracks user's environmental impact
-- ============================================
CREATE TABLE IF NOT EXISTS user_impact (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_carbon_saved DECIMAL(10,2) DEFAULT 0, -- kg
  total_water_saved DECIMAL(10,2) DEFAULT 0, -- liters
  total_energy_saved DECIMAL(10,2) DEFAULT 0, -- kWh
  total_items_scanned INTEGER DEFAULT 0,
  total_items_recycled INTEGER DEFAULT 0,
  green_points INTEGER DEFAULT 0,
  level VARCHAR(50) DEFAULT 'Eco Starter',
  badges JSONB DEFAULT '[]', -- Array of earned badge IDs with dates
  current_streak INTEGER DEFAULT 0, -- Days in a row
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own impact" ON user_impact
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own impact" ON user_impact
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update impact after scan
CREATE OR REPLACE FUNCTION update_user_impact()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user impact record
  INSERT INTO user_impact (user_id, total_carbon_saved, total_water_saved, total_energy_saved, total_items_scanned, total_items_recycled, green_points, updated_at)
  VALUES (
    NEW.user_id,
    COALESCE(NEW.carbon_saved_kg, 0),
    COALESCE(NEW.water_saved_l, 0),
    COALESCE(NEW.energy_saved_kwh, 0),
    1,
    CASE WHEN NEW.action_taken = 'recycled' OR NEW.action_taken = 'drop_off' OR NEW.action_taken = 'pickup' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action_taken IS NOT NULL THEN 50 ELSE 10 END,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_carbon_saved = user_impact.total_carbon_saved + COALESCE(NEW.carbon_saved_kg, 0),
    total_water_saved = user_impact.total_water_saved + COALESCE(NEW.water_saved_l, 0),
    total_energy_saved = user_impact.total_energy_saved + COALESCE(NEW.energy_saved_kwh, 0),
    total_items_scanned = user_impact.total_items_scanned + 1,
    total_items_recycled = user_impact.total_items_recycled + CASE WHEN NEW.action_taken = 'recycled' OR NEW.action_taken = 'drop_off' OR NEW.action_taken = 'pickup' THEN 1 ELSE 0 END,
    green_points = user_impact.green_points + CASE WHEN NEW.action_taken IS NOT NULL THEN 50 ELSE 10 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update impact
CREATE TRIGGER after_scan_update_impact
  AFTER INSERT ON scanned_items
  FOR EACH ROW EXECUTE FUNCTION update_user_impact();

-- ============================================
-- 4. RECYCLING CENTERS TABLE
-- Stores nearby recycling centers
-- ============================================
CREATE TABLE IF NOT EXISTS recycling_centers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  center_type VARCHAR(50) NOT NULL, -- 'ewaste', 'plastic', 'metal', 'glass', 'paper', 'general'
  phone VARCHAR(20),
  operating_hours TEXT,
  accepted_materials TEXT[],
  pickup_available BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (public read-only)
ALTER TABLE recycling_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recycling centers" ON recycling_centers
  FOR SELECT USING (true);

-- Insert sample recycling centers
INSERT INTO recycling_centers (name, address, latitude, longitude, center_type, phone, operating_hours, accepted_materials, pickup_available) VALUES
('Green Earth Recycling', '123 Eco Street, Mumbai', 19.0760, 72.8777, 'general', '+91-9876543210', 'Mon-Sat: 9AM-6PM', ARRAY['plastic', 'paper', 'metal', 'glass'], true),
('E-Waste Hub', '456 Tech Park, Delhi', 28.6139, 77.2090, 'ewaste', '+91-9876543211', 'Mon-Fri: 10AM-7PM', ARRAY['ewaste'], true),
('Plastic回收中心', '789 Green Avenue, Bangalore', 12.9716, 77.5946, 'plastic', '+91-9876543212', 'Mon-Sun: 8AM-8PM', ARRAY['plastic'], false)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. BADGES TABLE
-- Available badges users can earn
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL, -- 'scans', 'carbon', 'water', 'points', 'streak'
  requirement_value DECIMAL(10,2) NOT NULL,
  points_reward INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert available badges
INSERT INTO badges (id, name, description, icon, requirement_type, requirement_value, points_reward) VALUES
('first_scan', 'First Scan', 'Scan your first item', '📸', 'scans', 1, 50),
('eco_warrior', 'Eco Warrior', 'Save 10kg CO₂', '🌍', 'carbon', 10, 100),
('recycling_pro', 'Recycling Pro', 'Recycle 20 items', '♻️', 'scans', 20, 150),
('water_saver', 'Water Saver', 'Save 100L water', '💧', 'water', 100, 100),
('energy_hero', 'Energy Hero', 'Save 5kWh energy', '⚡', 'energy', 5, 100),
('green_champion', 'Green Champion', 'Earn 500 points', '🏆', 'points', 500, 0),
('consistent', 'Consistent', 'Scan 7 days in a row', '🔥', 'streak', 7, 200),
('influencer', 'Influencer', 'Share 5 items', '🌟', 'scans', 5, 75)
ON CONFLICT DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_scanned_items_user_id ON scanned_items(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_items_created_at ON scanned_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_impact_user_id ON user_impact(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(material_type);
CREATE INDEX IF NOT EXISTS idx_recycling_centers_type ON recycling_centers(center_type);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate carbon saved
CREATE OR REPLACE FUNCTION calculate_carbon_saved(p_material_type VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
  v_carbon_new DECIMAL;
  v_carbon_recycled DECIMAL;
BEGIN
  SELECT carbon_new, carbon_recycled INTO v_carbon_new, v_carbon_recycled
  FROM materials WHERE material_type = p_material_type LIMIT 1;
  
  IF v_carbon_new IS NULL THEN RETURN 0; END IF;
  
  RETURN ((v_carbon_new - v_carbon_recycled) / v_carbon_new * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user level based on points
CREATE OR REPLACE FUNCTION update_user_level(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_points INTEGER;
  v_level VARCHAR(50);
BEGIN
  SELECT green_points INTO v_points FROM user_impact WHERE user_id = p_user_id;
  IF v_points IS NULL THEN RETURN; END IF;
  
  CASE
    WHEN v_points >= 1000 THEN v_level := 'Eco Champion';
    WHEN v_points >= 750 THEN v_level := 'Green Guardian';
    WHEN v_points >= 500 THEN v_level := 'Green Champion';
    WHEN v_points >= 250 THEN v_level := 'Eco Warrior';
    WHEN v_points >= 100 THEN v_level := 'Recycling Enthusiast';
    ELSE v_level := 'Eco Starter';
  END CASE;
  
  UPDATE user_impact SET level = v_level WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEW FOR DASHBOARD
-- ============================================
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  ui.user_id,
  ui.total_carbon_saved,
  ui.total_water_saved,
  ui.total_energy_saved,
  ui.total_items_scanned,
  ui.total_items_recycled,
  ui.green_points,
  ui.level,
  (ui.total_items_scanned - ui.total_items_recycled) as items_pending,
  ROUND((ui.total_items_recycled::DECIMAL / NULLIF(ui.total_items_scanned, 0) * 100), 1) as recycling_rate
FROM user_impact ui;

GRANT SELECT ON user_dashboard TO authenticated;
