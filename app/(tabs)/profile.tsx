import { useAuth } from '@/context/AuthContext';
import { useJournal, ScannedItem } from '@/context/JournalContext';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Animated } from 'react-native';
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
  { id: 'first-scan', name: 'First Scan', icon: '📸', description: 'Scan your first item', criteria: (s) => s.totalItemsScanned >= 1 },
  { id: 'eco-warrior', name: 'Eco Warrior', icon: '🌍', description: 'Save 1kg CO₂', criteria: (s) => s.totalCo2Saved >= 1 },
  { id: 'recycling-pro', name: 'Recycling Pro', icon: '♻️', description: 'Recycle 5 items', criteria: (s) => s.totalItemsRecycled >= 5 },
  { id: 'water-saver', name: 'Water Saver', icon: '💧', description: 'Save 10L water', criteria: (s) => s.totalWaterSaved >= 10 },
  { id: 'energy-hero', name: 'Energy Hero', icon: '⚡', description: 'Save 1kWh energy', criteria: (s) => s.totalEnergySaved >= 1 },
  { id: 'green-champion', name: 'Green Champion', icon: '🏆', description: 'Earn 100 points', criteria: (s) => s.greenPoints >= 100 },
  { id: 'consistent', name: 'Consistent', icon: '🔥', description: 'Scan 3 days in a row', criteria: (s) => s.consecutiveDays >= 3 },
  { id: 'influencer', name: 'Influencer', icon: '🌟', description: 'Share 3 items', criteria: (s) => s.sharesCount >= 3 },
  { id: 'master-recycler', name: 'Master Recycler', icon: '🌿', description: 'Recycle 20 items', criteria: (s) => s.totalItemsRecycled >= 20 },
  { id: 'climate-hero', name: 'Climate Hero', icon: '🌎', description: 'Save 10kg CO₂', criteria: (s) => s.totalCo2Saved >= 10 },
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

  const recyclingRate = userImpact.totalItemsScanned > 0 ? ((userImpact.totalItemsRecycled / userImpact.totalItemsScanned) * 100).toFixed(0) : 0;
  const badgesEarned = earnedBadges.filter(b => b.earned).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="px-4 pt-4 pb-3 bg-card">
        <Text className="text-2xl font-bold text-textPrimary font-poppins">My Impact</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-card px-4 pb-5 items-center">
          <View className="items-center mb-3">
            <View className="py-2 px-4 rounded-full bg-green-600 justify-center items-center border-2 border-black mb-3">
              <Text className="text-4xl text-white font-bold">{session?.user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View className="bg-black px-4 py-1 rounded-full">
              <Text className="text-xs text-white font-semibold">{userImpact.level}</Text>
            </View>
          </View>

          <Text className="text-xl font-bold text-textPrimary font-poppins mb-4">
            {user?.name || session?.user?.email?.split('@')[0] || 'Eco Hero'}
          </Text>

          <View className="w-full bg-background rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-2.5">
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">⭐</Text>
                <Text className="text-2xl font-bold text-warning font-poppins">{userImpact.greenPoints}</Text>
              </View>
              <Text className="text-xs text-textSecondary font-poppins">
                {userImpact.nextLevelPoints - userImpact.greenPoints > 0 ? `${userImpact.nextLevelPoints - userImpact.greenPoints} points to next level` : 'Max level reached!'}
              </Text>
            </View>
            <View className="h-3 bg-border rounded-full overflow-hidden">
              <View className="h-full bg-warning rounded-full" style={{ width: `${Math.min((userImpact.greenPoints / userImpact.nextLevelPoints) * 100, 100)}%` }} />
            </View>
          </View>
        </View>

        <View className="flex-row px-4 py-3 bg-card border-b border-border gap-2">
          {(['impact', 'badges', 'history'] as const).map((tab) => (
            <TouchableOpacity key={tab} className={`flex-1 py-2.5 rounded-xl ${activeTab === tab ? 'bg-primaryLight' : 'bg-background'}`} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
              <Text className={`text-xs font-medium text-center font-poppins ${activeTab === tab ? 'text-primary' : 'text-textSecondary'}`}>
                {tab === 'impact' ? '📊 Impact' : tab === 'badges' ? '🏅 Badges' : '📜 History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'impact' && (
          <View className="px-4 pt-4">
            <Text className="text-lg font-semibold text-textPrimary font-poppins mb-3">🌱 Environmental Impact</Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="w-[48%] bg-card rounded-2xl p-4 items-center shadow-sm">
                <View className="w-12 h-12 rounded-xl bg-primaryLight items-center justify-center mb-3"><Text className="text-2xl">🌍</Text></View>
                <Text className="text-xl font-bold text-primary font-poppins">{userImpact.totalCo2Saved.toFixed(1)} kg</Text>
                <Text className="text-xs text-textSecondary font-poppins">CO₂ Saved</Text>
              </View>
              <View className="w-[48%] bg-card rounded-2xl p-4 items-center shadow-sm">
                <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mb-3"><Text className="text-2xl">💧</Text></View>
                <Text className="text-xl font-bold text-blue-500 font-poppins">{userImpact.totalWaterSaved.toFixed(0)}L</Text>
                <Text className="text-xs text-textSecondary font-poppins">Water Saved</Text>
              </View>
              <View className="w-[48%] bg-card rounded-2xl p-4 items-center shadow-sm">
                <View className="w-12 h-12 rounded-xl bg-amber-100 items-center justify-center mb-3"><Text className="text-2xl">⚡</Text></View>
                <Text className="text-xl font-bold text-amber-500 font-poppins">{userImpact.totalEnergySaved.toFixed(1)}kWh</Text>
                <Text className="text-xs text-textSecondary font-poppins">Energy Saved</Text>
              </View>
              <View className="w-[48%] bg-card rounded-2xl p-4 items-center shadow-sm">
                <View className="w-12 h-12 rounded-xl bg-primaryLight items-center justify-center mb-3"><Text className="text-2xl">♻️</Text></View>
                <Text className="text-xl font-bold text-primary font-poppins">{userImpact.totalItemsRecycled}</Text>
                <Text className="text-xs text-textSecondary font-poppins">Items Recycled</Text>
              </View>
            </View>

            <Text className="text-lg font-semibold text-textPrimary font-poppins mt-6 mb-3">📈 Progress</Text>
            <View className="flex-row gap-4">
              <View className="flex-1 bg-card rounded-2xl p-4 items-center shadow-sm">
                <ProgressRing progress={parseFloat(recyclingRate as string)} color="#10B981" />
                <Text className="text-sm font-semibold text-textPrimary font-poppins mt-2">Recycling Rate</Text>
                <Text className="text-xs text-textSecondary">{recyclingRate}% recycled</Text>
              </View>
              <View className="flex-1 bg-card rounded-2xl p-4 items-center shadow-sm">
                <ProgressRing progress={parseFloat(((badgesEarned / badgeDefinitions.length) * 100).toFixed(0))} color="#F59E0B" />
                <Text className="text-sm font-semibold text-textPrimary font-poppins mt-2">Badges Earned</Text>
                <Text className="text-xs text-textSecondary">{badgesEarned}/{badgeDefinitions.length}</Text>
              </View>
            </View>

            <View className="bg-card rounded-2xl p-4 mt-4 shadow-sm">
              <Text className="text-base font-semibold text-textPrimary font-poppins mb-4">CO₂ Saved This Year</Text>
              <View className="flex-row items-end justify-between h-24 px-2">
                {monthlyData.map((data, index) => {
                  const maxCo2 = Math.max(...monthlyData.map(d => d.co2Saved), 1);
                  const height = (data.co2Saved / maxCo2) * 80;
                  return (
                    <View key={index} className="items-center flex-1">
                      <Text className="text-[10px] text-textSecondary mb-1">{data.co2Saved > 0.1 ? `${data.co2Saved.toFixed(1)}kg` : ''}</Text>
                      <View className="w-4 rounded-t-sm" style={{ height: Math.max(height, 4), backgroundColor: data.co2Saved > 0.1 ? '#10B981' : '#E5E7EB' }} />
                      <Text className="text-xs text-textSecondary mt-1">{data.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="bg-card rounded-2xl mt-4 shadow-sm">
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-sm text-textSecondary font-poppins">Total Items Scanned</Text>
                <Text className="text-base font-semibold text-textPrimary">{userImpact.totalItemsScanned}</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-sm text-textSecondary font-poppins">Recycling Rate</Text>
                <Text className="text-base font-semibold text-primary">{recyclingRate}%</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-sm text-textSecondary font-poppins">Badges Earned</Text>
                <Text className="text-base font-semibold text-warning">{badgesEarned}/{badgeDefinitions.length}</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-sm text-textSecondary font-poppins">Cart Items</Text>
                <Text className="text-base font-semibold text-info">{scannedCartCount}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
          <View className="px-4 pt-4">
            <Text className="text-lg font-semibold text-textPrimary font-poppins mb-3">🏅 Your Badges</Text>
            <View className="bg-card rounded-xl p-4 mb-4">
              <Text className="text-sm font-semibold text-textPrimary mb-3">Progress: {badgesEarned} / {badgeDefinitions.length} badges</Text>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View className="h-full bg-primary rounded-full" style={{ width: `${(badgesEarned / badgeDefinitions.length) * 100}%` }} />
              </View>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {earnedBadges.map((badge) => (
                <View key={badge.id} className={`w-[47%] bg-card rounded-2xl p-4 items-center ${!badge.earned && 'opacity-60'}`}>
                  <View className="w-14 h-14 rounded-full bg-primaryLight items-center justify-center mb-3">
                    <Text className="text-3xl">{badge.earned ? badge.icon : '🔒'}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-textPrimary text-center font-poppins mb-1">{badge.name}</Text>
                  <Text className="text-xs text-textSecondary text-center font-poppins mb-2">{badge.description}</Text>
                  {badge.earned && badge.earnedDate && (
                    <Text className="text-[10px] text-primary font-medium">Earned {formatDate(badge.earnedDate)}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View className="px-4 pt-4">
            <Text className="text-lg font-semibold text-textPrimary font-poppins mb-3">📜 Scan History</Text>
            {scannedItems.length === 0 ? (
              <View className="bg-card rounded-2xl p-10 items-center">
                <Text className="text-5xl mb-4">📋</Text>
                <Text className="text-lg font-semibold text-textPrimary font-poppins mb-2">No scans yet</Text>
                <Text className="text-sm text-textSecondary font-poppins text-center mb-6">Start scanning items to build your history</Text>
                <TouchableOpacity className="bg-primary px-8 py-3 rounded-lg" onPress={() => router.push('/scan')}>
                  <Text className="text-base font-semibold text-white font-poppins">Scan Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-3">
                {scannedItems.map((item) => (
                  <View key={item.id} className="flex-row items-center bg-card rounded-xl p-3">
                    <View className="w-11 h-11 rounded-full bg-primaryLight items-center justify-center mr-3">
                      <Text className="text-xl">{item.recyclability === 'fully' ? '♻️' : item.recyclability === 'partially' ? '⚠️' : '❌'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-textPrimary font-poppins">{item.productName}</Text>
                      <Text className="text-xs text-textSecondary font-poppins">{formatDate(item.scannedAt)}</Text>
                    </View>
                    <View className="bg-primaryLight px-2.5 py-1 rounded-lg">
                      <Text className="text-xs font-semibold text-primary">+{item.savingsPercent}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="px-4 pt-6 pb-8">
  {user || session ? (
    <TouchableOpacity
      className="bg-red-100 py-3.5 rounded-xl items-center border border-red-500"
      onPress={handleLogout}
      activeOpacity={0.8}
    >
      <Text className="text-base font-semibold text-red-600">Logout</Text>
    </TouchableOpacity>
  ) : (
    <View className="flex-row justify-between gap-3">
      <TouchableOpacity
        className="flex-1 bg-green-600 border-2 border-black py-3.5 rounded-xl items-center"
        onPress={() => router.push('/(auth)/login')}
        activeOpacity={0.8}
      >
        <Text className="text-base font-semibold text-white">Login/Signup</Text>
      </TouchableOpacity>
    </View>
  )}
</View>
      </ScrollView>
    </SafeAreaView>
  );
}
