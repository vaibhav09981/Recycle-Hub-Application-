import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

// Types for our database
export interface Material {
  id: number;
  material_name: string;
  material_type: string;
  carbon_new: number;
  carbon_recycled: number;
  water_saved: number;
  energy_saved: number;
  recyclable_status: 'fully' | 'partially' | 'no';
  recycling_tips: string[];
  icon: string;
}

export interface ScannedItem {
  id: number;
  user_id: string;
  item_name: string;
  material_type: string;
  recyclable_status: string;
  carbon_saved_percent: number;
  carbon_saved_kg: number;
  water_saved_l: number;
  energy_saved_kwh: number;
  action_taken: string | null;
  recycling_tips: string[];
  created_at: string;
}

export interface UserImpact {
  user_id: string;
  total_carbon_saved: number;
  total_water_saved: number;
  total_energy_saved: number;
  total_items_scanned: number;
  total_items_recycled: number;
  green_points: number;
  level: string;
  badges: { [key: string]: string };
  current_streak: number;
}

export interface RecyclingCenter {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  center_type: string;
  phone: string;
  operating_hours: string;
  accepted_materials: string[];
  pickup_available: boolean;
}

// Database helper functions
export const db = {
  // Materials
  async getMaterials() {
    const { data, error } = await supabase.from('materials').select('*');
    if (error) throw error;
    return data as Material[];
  },

  async getMaterialByType(type: string) {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('material_type', type)
      .single();
    if (error) return null;
    return data as Material;
  },

  // Scanned Items
  async saveScannedItem(item: Omit<ScannedItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('scanned_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getScannedItems(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('scanned_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as ScannedItem[];
  },

  async updateScanAction(itemId: number, action: string) {
    const { data, error } = await supabase
      .from('scanned_items')
      .update({ action_taken: action })
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // User Impact
  async getUserImpact(userId: string) {
    const { data, error } = await supabase
      .from('user_impact')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as UserImpact;
  },

  // Recycling Centers
  async getRecyclingCenters(type?: string) {
    let query = supabase.from('recycling_centers').select('*');
    if (type) {
      query = query.eq('center_type', type);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as RecyclingCenter[];
  },

  async getNearbyCenters(lat: number, lng: number, radiusKm = 10) {
    // For PostgreSQL with PostGIS, use this:
    // This is a simplified version - for production, use PostGIS
    const { data, error } = await supabase
      .from('recycling_centers')
      .select('*')
      .limit(10);
    if (error) throw error;
    
    // Calculate distance client-side (simplified)
    const centersWithDistance = (data as RecyclingCenter[]).map(center => {
      const distance = calculateDistance(
        lat, lng,
        center.latitude, center.longitude
      );
      return { ...center, distance };
    });
    
    return centersWithDistance
      .filter(c => c.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance) as (RecyclingCenter & { distance: number })[];
  },

  // Badges
  async getBadges() {
    const { data, error } = await supabase.from('badges').select('*');
    if (error) throw error;
    return data;
  },
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
