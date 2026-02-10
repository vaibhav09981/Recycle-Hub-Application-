import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

interface MonthlyData {
  month: string;
  co2Saved: number;
  itemsScanned: number;
}

const badges: Badge[] = [
  { id: '1', name: 'First Scan', icon: '📸', description: 'Scan your first item', earned: true, earnedDate: '2024-01-15' },
  { id: '2', name: 'Eco Warrior', icon: '🌍', description: 'Save 10kg CO₂', earned: true, earnedDate: '2024-01-20' },
  { id: '3', name: 'Recycling Pro', icon: '♻️', description: 'Recycle 20 items', earned: false },
  { id: '4', name: 'Water Saver', icon: '💧', description: 'Save 100L water', earned: false },
  { id: '5', name: 'Energy Hero', icon: '⚡', description: 'Save 5kWh energy', earned: false },
  { id: '6', name: 'Green Champion', icon: '🏆', description: 'Earn 500 points', earned: false },
  { id: '7', name: 'Consistent', icon: '🔥', description: 'Scan 7 days in a row', earned: false },
  { id: '8', name: 'Influencer', icon: '🌟', description: 'Share 5 items', earned: false },
];

const monthlyData: MonthlyData[] = [
  { month: 'Jan', co2Saved: 2.5, itemsScanned: 5 },
  { month: 'Feb', co2Saved: 4.2, itemsScanned: 8 },
  { month: 'Mar', co2Saved: 6.8, itemsScanned: 12 },
  { month: 'Apr', co2Saved: 8.1, itemsScanned: 15 },
  { month: 'May', co2Saved: 12.5, itemsScanned: 22 },
  { month: 'Jun', co2Saved: 15.3, itemsScanned: 28 },
];

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'impact' | 'badges' | 'history'>('impact');

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  // Mock user impact data
  const userImpact = {
    totalCo2Saved: 49.4, // kg
    totalWaterSaved: 210, // L
    totalEnergySaved: 7.2, // kWh
    totalItemsScanned: 90,
    totalItemsRecycled: 75,
    greenPoints: 485,
    level: 'Eco Warrior',
    nextLevelPoints: 500,
  };

  const getProgressWidth = () => {
    const progress = (userImpact.greenPoints / userImpact.nextLevelPoints) * 100;
    return `${Math.min(progress, 100)}%`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
          My Impact
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingBottom: 20 }}>
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ 
              width: 90, 
              height: 90, 
              borderRadius: 45, 
              backgroundColor: '#10B981', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: 12,
              borderWidth: 4,
              borderColor: '#F0FDF4',
            }}>
              <Text style={{ fontSize: 36, color: '#FFFFFF', fontWeight: 'bold' }}>
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', fontFamily: 'Poppins' }}>
              {session?.user?.email?.split('@')[0] || 'Eco Hero'}
            </Text>
            <View style={{ backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, marginTop: 8 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', fontFamily: 'Poppins' }}>
                {userImpact.level}
              </Text>
            </View>
          </View>

          {/* Green Points Progress */}
          <View style={{ backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>⭐</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
                  {userImpact.greenPoints}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                {userImpact.nextLevelPoints - userImpact.greenPoints} points to next level
              </Text>
            </View>
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ width: getProgressWidth() as any, height: '100%', backgroundColor: '#F59E0B', borderRadius: 6 }} />
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
          {(['impact', 'badges', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: activeTab === tab ? '#10B981' : '#F3F4F6' }}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={{ color: activeTab === tab ? '#FFFFFF' : '#374151', fontWeight: '600', fontSize: 13, fontFamily: 'Poppins', textTransform: 'capitalize' }}>
                {tab === 'impact' ? '📊 Impact' : tab === 'badges' ? '🏅 Badges' : '📜 History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'impact' && (
          <View style={{ padding: 16 }}>
            {/* Impact Stats Grid */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 12 }}>
              🌱 Environmental Impact
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <View style={{ width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🌍</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>
                  {userImpact.totalCo2Saved} kg
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                  CO₂ Emissions Saved
                </Text>
              </View>
              
              <View style={{ width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>💧</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6', fontFamily: 'Poppins' }}>
                  {userImpact.totalWaterSaved}L
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                  Water Saved
                </Text>
              </View>
              
              <View style={{ width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>⚡</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B', fontFamily: 'Poppins' }}>
                  {userImpact.totalEnergySaved}kWh
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                  Energy Saved
                </Text>
              </View>
              
              <View style={{ width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>♻️</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>
                  {userImpact.totalItemsRecycled}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                  Items Recycled
                </Text>
              </View>
            </View>

            {/* Monthly Chart */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 12 }}>
              📈 Monthly Progress
            </Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              {/* Simple Bar Chart */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingVertical: 12 }}>
                {monthlyData.map((data, index) => {
                  const maxCo2 = Math.max(...monthlyData.map(d => d.co2Saved));
                  const height = (data.co2Saved / maxCo2) * 80;
                  return (
                    <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 10, color: '#6B7280', fontFamily: 'Poppins', marginBottom: 4 }}>
                        {data.co2Saved}kg
                      </Text>
                      <View style={{ width: 24, height: height, backgroundColor: '#10B981', borderRadius: 4, marginBottom: 4 }} />
                      <Text style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'Poppins' }}>
                        {data.month}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Quick Stats */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins' }}>Total Items Scanned</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>{userImpact.totalItemsScanned}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins' }}>Recycling Rate</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins' }}>
                  {((userImpact.totalItemsRecycled / userImpact.totalItemsScanned) * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins' }}>Badges Earned</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#F59E0B', fontFamily: 'Poppins' }}>
                  {badges.filter(b => b.earned).length}/{badges.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 12 }}>
              🏅 Your Badges
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {badges.map((badge) => (
                <View
                  key={badge.id}
                  style={{
                    width: '47%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    padding: 16,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    opacity: badge.earned ? 1 : 0.5,
                  }}
                >
                  <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 40 }}>{badge.earned ? badge.icon : '🔒'}</Text>
                </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', textAlign: 'center' }}>
                    {badge.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center', marginTop: 4 }}>
                    {badge.description}
                  </Text>
                  {badge.earned && badge.earnedDate && (
                    <Text style={{ fontSize: 10, color: '#10B981', fontFamily: 'Poppins', marginTop: 8 }}>
                      Earned {badge.earnedDate}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 12 }}>
              📜 Scan History
            </Text>
            {[
              { name: 'Plastic Water Bottle', date: 'Today', co2: 42, recyclable: true },
              { name: 'Cardboard Box', date: 'Yesterday', co2: 65, recyclable: true },
              { name: 'E-waste Device', date: '2 days ago', co2: 30, recyclable: false },
              { name: 'Glass Jar', date: '3 days ago', co2: 70, recyclable: true },
              { name: 'Aluminum Can', date: '4 days ago', co2: 85, recyclable: true },
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.recyclable ? '#F0FDF4' : '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 22 }}>{item.recyclable ? '♻️' : '⚠️'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    {item.date}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins' }}>
                    +{item.co2}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <View style={{ padding: 16, paddingBottom: 32 }}>
          <TouchableOpacity
            style={{ 
              backgroundColor: '#EF4444', 
              paddingVertical: 16, 
              borderRadius: 12,
              alignItems: 'center'
            }}
            onPress={handleLogout}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Poppins' }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
