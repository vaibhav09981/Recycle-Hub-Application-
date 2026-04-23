import { useAuth } from '@/context/AuthContext';
import { useJournal, ScannedItem } from '@/context/JournalContext';
import { useRouter } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View, Animated, StatusBar } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: (stats: UserStats) => boolean;
}

interface UserStats {
  totalItemsScanned: number;
  totalItemsRecycled: number;
  totalCo2Saved: number;
  totalWaterSaved: number;
  totalEnergySaved: number;
  greenPoints: number;
  consecutiveDays: number;
  sharesCount: number;
}

const badgeDefinitions: BadgeDefinition[] = [
  { id: 'first-scan', name: 'First Scan', icon: 'scan', description: 'Scan your first item', criteria: (s) => s.totalItemsScanned >= 1 },
  { id: 'eco-warrior', name: 'Eco Warrior', icon: 'globe', description: 'Save 1kg CO₂', criteria: (s) => s.totalCo2Saved >= 1 },
  { id: 'recycling-pro', name: 'Recycling Pro', icon: 'refresh-circle', description: 'Recycle 5 items', criteria: (s) => s.totalItemsRecycled >= 5 },
  { id: 'water-saver', name: 'Water Saver', icon: 'water', description: 'Save 10L water', criteria: (s) => s.totalWaterSaved >= 10 },
  { id: 'energy-hero', name: 'Energy Hero', icon: 'flash', description: 'Save 1kWh energy', criteria: (s) => s.totalEnergySaved >= 1 },
  { id: 'green-champion', name: 'Green Champion', icon: 'trophy', description: 'Earn 100 points', criteria: (s) => s.greenPoints >= 100 },
  { id: 'consistent', name: 'Consistent', icon: 'flame', description: 'Scan 3 days in a row', criteria: (s) => s.consecutiveDays >= 3 },
  { id: 'influencer', name: 'Influencer', icon: 'star', description: 'Share 3 items', criteria: (s) => s.sharesCount >= 3 },
  { id: 'master-recycler', name: 'Master Recycler', icon: 'leaf', description: 'Recycle 20 items', criteria: (s) => s.totalItemsRecycled >= 20 },
  { id: 'climate-hero', name: 'Climate Hero', icon: 'earth', description: 'Save 10kg CO₂', criteria: (s) => s.totalCo2Saved >= 10 },
];

function ProgressRing({ progress, color, size = 80, strokeWidth = 8 }: { progress: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '-90deg' }] }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: '#E5E7EB' }}>
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
          }}
        />
      </View>
      <View style={[{}, { position: 'absolute', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '90deg' }], width: size, height: size }]}>
        <View
          style={{
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: color,
            borderLeftColor: color,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
            {Math.round(progress)}%
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

function calculateConsecutiveDays(items: ScannedItem[]): number {
  if (items.length === 0) return 0;
  const sortedByDate = [...items].sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  let consecutive = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sortedByDate.length - 1; i++) {
    const currentDate = new Date(sortedByDate[i].scannedAt);
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(sortedByDate[i + 1].scannedAt);
    nextDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) consecutive++;
    else break;
  }
  return consecutive;
}

export default function ProfileScreen() {
  const { user, session, signOut } = useAuth();
  const { scannedItems, getTotalCarbonSaved, scannedCartCount } = useJournal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'impact' | 'badges' | 'history'>('impact');

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const userStats: UserStats = useMemo(() => ({
    totalItemsScanned: scannedItems.length,
    totalItemsRecycled: scannedItems.filter(item => item.recyclability === 'fully' || item.recyclability === 'partially').length,
    totalCo2Saved: getTotalCarbonSaved(),
    totalWaterSaved: scannedItems.reduce((sum, item) => sum + parseFloat(item.waterSaved || '0'), 0),
    totalEnergySaved: scannedItems.reduce((sum, item) => sum + parseFloat(item.energySaved || '0'), 0),
    greenPoints: Math.round(getTotalCarbonSaved() * 10),
    consecutiveDays: calculateConsecutiveDays(scannedItems),
    sharesCount: 0,
  }), [scannedItems, getTotalCarbonSaved()]);

  const earnedBadges = useMemo(() => {
    return badgeDefinitions.map(badge => ({
      ...badge,
      earned: badge.criteria(userStats),
      earnedDate: badge.criteria(userStats)
        ? scannedItems.filter(() => badge.criteria(userStats)).sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())[0]?.scannedAt
        : undefined,
    }));
  }, [userStats, scannedItems]);

  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    return monthNames.slice(0, currentMonth + 1).map((month, index) => {
      const monthScans = scannedItems.filter(item => {
        const scanDate = new Date(item.scannedAt);
        return scanDate.getMonth() === index;
      });
      const co2Saved = monthScans.reduce((sum, item) => sum + parseFloat(item.carbonSaved || '0'), 0);
      return { month, co2Saved: co2Saved || (index === currentMonth ? 0 : 0.1), itemsScanned: monthScans.length };
    });
  }, [scannedItems]);

  const userImpact = {
    totalCo2Saved: userStats.totalCo2Saved,
    totalWaterSaved: userStats.totalWaterSaved,
    totalEnergySaved: userStats.totalEnergySaved,
    totalItemsScanned: userStats.totalItemsScanned,
    totalItemsRecycled: userStats.totalItemsRecycled,
    greenPoints: userStats.greenPoints,
    level: userStats.greenPoints >= 500 ? 'Green Champion' : userStats.greenPoints >= 200 ? 'Eco Warrior' : userStats.greenPoints >= 50 ? 'Eco Starter' : 'Beginner',
    nextLevelPoints: userStats.greenPoints >= 500 ? 1000 : userStats.greenPoints >= 200 ? 500 : userStats.greenPoints >= 50 ? 200 : 50,
  };

  const recyclingRate = useMemo(
    () => userImpact.totalItemsScanned > 0
      ? ((userImpact.totalItemsRecycled / userImpact.totalItemsScanned) * 100).toFixed(0)
      : 0,
    [userImpact.totalItemsScanned, userImpact.totalItemsRecycled]
  );

  const badgesEarned = useMemo(
    () => earnedBadges.filter(b => b.earned).length,
    [earnedBadges]
  );

  const handleTabChange = useCallback((tab: 'impact' | 'badges' | 'history') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const progressPercent = Math.min((userImpact.greenPoints / userImpact.nextLevelPoints) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Crazy Asymmetric Header */}
        <View className="px-6 pt-10 pb-20 bg-emerald-600 rounded-b-[60px] relative overflow-hidden">
          {/* Decorative floating circle */}
          <View className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          
          <View className="flex-row items-center justify-between">
            <View className="relative">
              <View 
                className="w-24 h-24 rounded-[30px] bg-white items-center justify-center shadow-xl border-2 border-emerald-400"
                style={{ transform: [{ rotate: '5deg' }] }}
              >
                <Text 
                  className="text-4xl text-emerald-600 font-bold"
                  style={{ transform: [{ rotate: '-5deg' }] }}
                >
                  {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              {/* Level floating badge */}
              <View 
                className="absolute -top-3 -right-3 bg-white px-3 py-1 rounded-full border-2 border-emerald-600 shadow-md"
                style={{ transform: [{ rotate: '-10deg' }] }}
              >
                <Text className="text-[10px] text-emerald-600 font-black">LVL {Math.floor(userImpact.greenPoints / 100) + 1}</Text>
              </View>
            </View>

            <View className="flex-1 ml-6 items-start">
              <Text className="text-3xl font-poppins-black text-white">
                {user?.name || session?.user?.email?.split('@')[0] || 'Eco Hero'}
              </Text>
              <View className="bg-white/20 px-3 py-1 rounded-xl mt-1 self-start">
                <Text className="text-[10px] text-white font-bold uppercase tracking-widest">{userImpact.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Floating XP Tracker Card (Overlapping Header) */}
        <View className="px-6 -mt-10">
          <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-emerald-900/10 border border-emerald-50">
            <View className="flex-row items-center justify-between mb-4">
               <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={16} color="#14B8A6" />
                  <Text className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-widest font-poppins">Level Growth</Text>
               </View>
               <Text className="text-lg font-poppins-black text-earth">{userImpact.greenPoints} GP</Text>
            </View>
            
            <View className="h-6 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-1">
              <View 
                className="h-full bg-teal rounded-xl" 
                style={{ width: `${progressPercent}%` }} 
              />
            </View>
            <Text className="text-[10px] text-earth font-poppins mt-3 text-center font-bold">
               {userImpact.nextLevelPoints - userImpact.greenPoints} GP to next rank
            </Text>
          </View>
        </View>

        {/* Philosophy Card - Asymmetric Design */}
        <View className="px-6 mt-8">
           <View className="bg-white border-2 border-earth rounded-[40px] rounded-tl-none p-8 shadow-sm relative">
              <View 
                className="absolute -top-10 right-0 bg-earth px-6 py-2 rounded-t-[20px]"
                style={{ transform: [{ rotate: '2deg' }] }}
              >
                 <Text className="text-white text-[10px] font-black uppercase font-poppins">Our Ethos</Text>
              </View>
              <Ionicons name="chatbubble-outline" size={32} color="#78350F" className="opacity-20 absolute top-8 right-8" />
              <Text className="text-earth text-lg font-bold font-poppins leading-7 italic pr-8">
                "We never charge the user. We charge the brands, corporates, and municipalities who benefit from what the user does."
              </Text>
           </View>
        </View>

        {/* Crazy Grid Stats */}
        <Text className="px-8 mt-10 text-[10px] font-black text-earth uppercase tracking-[4px] font-poppins mb-4 opacity-70">Impact Breakdown</Text>
        
        <View className="px-6 flex-row gap-4 mb-2">
            <View className="flex-1 bg-white border border-slate-100 rounded-[30px] p-5 h-44 shadow-sm items-center justify-center">
               <View className="w-12 h-12 bg-teal/10 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="planet" size={24} color="#14B8A6" />
               </View>
               <Text className="text-4xl font-poppins-black text-teal">{userImpact.totalCo2Saved.toFixed(1)}</Text>
               <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-poppins">kg CO₂ Offset</Text>
            </View>
            
            <View className="flex-1 gap-4">
                <View className="bg-white border border-slate-100 rounded-[30px] p-4 flex-1 shadow-sm flex-row items-center">
                  <View className="w-8 h-8 bg-teal/5 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="water" size={16} color="#14B8A6" />
                  </View>
                  <View>
                    <Text className="text-2xl font-poppins-black text-teal">{userImpact.totalWaterSaved.toFixed(0)}L</Text>
                    <Text className="text-[8px] text-slate-400 font-black uppercase">Conserved</Text>
                  </View>
                </View>
                
                <View className="bg-white border border-slate-100 rounded-[30px] p-4 flex-1 shadow-sm flex-row items-center">
                  <View className="w-8 h-8 bg-earth/5 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="flash" size={16} color="#78350F" />
                  </View>
                  <View>
                     <Text className="text-2xl font-poppins-black text-earth">{userImpact.totalEnergySaved.toFixed(1)}kWh</Text>
                     <Text className="text-[8px] text-slate-400 font-black uppercase">Energy Saved</Text>
                  </View>
                </View>
            </View>
        </View>

        {/* Redesigned Tab Selector */}
        <View className="px-6 py-6">
          <View className="flex-row gap-2">
            {(['impact', 'badges', 'history'] as const).map((tab) => (
              <TouchableOpacity 
                key={tab} 
                className={`flex-1 py-3.5 rounded-2xl border-2 ${activeTab === tab ? 'bg-emerald-600 border-emerald-600' : 'bg-transparent border-slate-100'}`} 
                onPress={() => handleTabChange(tab)}
                activeOpacity={0.8}
              >
                <Text className={`text-xs font-black text-center font-poppins uppercase tracking-widest ${activeTab === tab ? 'text-white' : 'text-slate-400'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === 'impact' && (
           <View className="px-6 mb-10">
              <View className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                 <View className="flex-row items-center justify-between mb-8">
                    <Text className="text-lg font-bold text-slate-900 font-poppins">Monthly Velocity</Text>
                    <View className="h-2 w-10 bg-emerald-600 rounded-full" />
                 </View>
                 
                 <View className="flex-row items-end justify-between h-32 px-2">
                    {monthlyData.map((data, index) => {
                      const maxCo2 = Math.max(...monthlyData.map(d => d.co2Saved), 1);
                      const height = (data.co2Saved / maxCo2) * 100;
                      return (
                        <View key={index} className="items-center flex-1">
                          <View 
                            className="w-4 rounded-full" 
                            style={{ height: Math.max(height, 6), backgroundColor: data.co2Saved > 0.1 ? '#10B981' : '#F1F5F9' }} 
                          />
                          <Text className="text-[8px] text-slate-400 font-black mt-3 font-poppins">{data.month}</Text>
                        </View>
                      );
                    })}
                 </View>
              </View>
              
              <View className="mt-6 flex-row gap-4">
                  <View className="flex-1 bg-white border border-slate-100 rounded-[30px] p-5 shadow-sm">
                      <Text className="text-slate-400 text-[10px] font-black uppercase mb-2">Items Diverted</Text>
                      <Text className="text-2xl font-black text-emerald-600 font-poppins">{userImpact.totalItemsRecycled}</Text>
                  </View>
                  <View className="flex-1 bg-white border border-slate-100 rounded-[30px] p-5 shadow-sm">
                      <Text className="text-slate-400 text-[10px] font-black uppercase mb-2">Impact Velocity</Text>
                      <Text className="text-2xl font-black text-emerald-600 font-poppins">{recyclingRate}%</Text>
                  </View>
              </View>
           </View>
        )}

        {activeTab === 'badges' && (
          <View className="px-6 pt-4 mb-10">
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {earnedBadges.map((badge) => (
                <View key={badge.id} className={`w-[48%] bg-white border border-slate-100 rounded-[32px] p-6 items-center ${!badge.earned && 'opacity-40'}`}>
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${badge.earned ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {badge.earned
                      ? <Ionicons name={badge.icon as any} size={28} color="#059669" />
                      : <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
                    }
                  </View>
                  <Text className={`text-[10px] font-black text-center font-poppins uppercase tracking-wider ${badge.earned ? 'text-slate-900' : 'text-slate-400'}`}>{badge.name}</Text>
                  <Text className="text-[9px] text-slate-400 font-poppins text-center mt-1">{badge.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View className="px-6 mb-10">
              {scannedItems.length === 0 ? (
                <View className="bg-white border border-slate-100 rounded-[40px] p-12 items-center">
                  <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-6">
                    <Ionicons name="search-outline" size={28} color="#CBD5E1" />
                  </View>
                  <Text className="text-sm font-bold text-slate-400 font-poppins text-center">No impact history yet.</Text>
                </View>
              ) : (
                <View className="space-y-4">
                  {scannedItems.map((item) => (
                    <View key={item.id} className="flex-row items-center bg-white border border-slate-100 rounded-2xl p-4">
                      <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mr-4">
                        <Ionicons 
                          name={item.recyclability === 'fully' ? 'checkmark-circle' : 'warning'} 
                          size={20} 
                          color={item.recyclability === 'fully' ? '#10B981' : '#F59E0B'} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-slate-900 font-poppins">{item.productName}</Text>
                        <Text className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{formatDate(item.scannedAt)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
          </View>
        )}

        <View className="px-6 mt-10">
          <TouchableOpacity
            className="w-full h-16 bg-red-50 border-2 border-red-500 rounded-[30px] items-center justify-center flex-row"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="power" size={18} color="#EF4444" />
            <Text className="text-sm font-black text-red-500 uppercase tracking-widest font-poppins ml-3">End Session</Text>
          </TouchableOpacity>
        </View>

        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
