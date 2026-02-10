import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

interface ScanHistoryItem {
  id: string;
  itemName: string;
  material: string;
  recyclable: 'fully' | 'partially' | 'no';
  carbonSaved: number;
  image?: string;
  date: string;
}

export default function HomeScreen() {
  const { session } = useAuth();
=======
export default function HomeScreen() {
  const { session } = useAuth();
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Mock scan history data
  const [scanHistory] = useState<ScanHistoryItem[]>([
    {
      id: '1',
      itemName: 'Plastic Water Bottle',
      material: 'Plastic (PET)',
      recyclable: 'fully',
      carbonSaved: 42,
      date: 'Today',
    },
    {
      id: '2',
      itemName: 'Cardboard Box',
      material: 'Cardboard',
      recyclable: 'fully',
      carbonSaved: 65,
      date: 'Yesterday',
    },
  ]);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleScan = () => {
    setIsScanning(true);
    // Navigate to scan screen or open camera
    router.push('/scan');
  };

  const getRecyclableColor = (status: string) => {
    switch (status) {
      case 'fully':
        return '#10B981';
      case 'partially':
        return '#F59E0B';
      case 'no':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getRecyclableIcon = (status: string) => {
    switch (status) {
      case 'fully':
        return '♻️';
      case 'partially':
        return '⚠️';
      case 'no':
        return '❌';
      default:
        return '❓';
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#F3F4F6', 
            borderRadius: 24, 
            paddingHorizontal: 16, 
            paddingVertical: 12 
          }}>
            <Text style={{ color: '#9CA3AF', marginRight: 12 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, color: '#374151', fontFamily: 'Poppins' }}

              placeholder="Search items..."


  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
            <Text className="text-gray-400 mr-3">🔍</Text>
            <TextInput
              className="flex-1 text-gray-700 font-poppins"
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
            Good Morning
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontFamily: 'Poppins' }}>{currentDate}</Text>
          
          {/* Impact Cards Row */}
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>🌱</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0 kg</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins' }}>CO₂ Saved</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>♻️</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins' }}>Items Recycled</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>⭐</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F59E0B', fontFamily: 'Poppins' }}>0</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins' }}>Green Points</Text>
            </View>
          </View>
        </View>

        {/* AI Scanner Card */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}>
            {/* Card Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>🤖</Text>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
                    AI Scanner
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    Powered by Gemini Vision
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins' }}>
                Scan Item
              </Text>
              <Text style={{ color: '#10B981' }}>✕</Text>
        <View className="px-4 pt-6">
          <Text className="text-2xl font-bold text-gray-900 font-poppins">
            Good Morning
          </Text>
          <View className="flex-row items-baseline mt-1">
            <Text className="text-5xl font-bold text-gray-900 font-poppins">0</Text>
            <Text className="text-base font-medium text-emerald-500 ml-2 font-poppins">
              Items Scanned
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mt-1 font-poppins">{currentDate}</Text>
        </View>

        {/* Main Card: Scan Item */}
        <View className="px-4 pt-6">
          <View className="bg-white rounded-2xl shadow-sm p-4">
            {/* Card Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-emerald-500 font-poppins">
                Scan Item
              </Text>
              <Text className="text-emerald-500">✕</Text>
            </View>

            {/* Camera/Upload Area */}
            <TouchableOpacity

              style={{ aspectRatio: 1.5, borderWidth: 3, borderColor: '#10B981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', borderStyle: 'dashed' }}
              onPress={handleScan}
              activeOpacity={0.8}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={{ backgroundColor: '#10B981', padding: 16, borderRadius: 50, marginBottom: 12 }}>
                  <Text style={{ fontSize: 32 }}>📷</Text>
              style={{ aspectRatio: 1, borderWidth: 2, borderColor: '#10B981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}
              onPress={handleUpload}
              activeOpacity={0.8}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📷</Text>
                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 24 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '500', fontFamily: 'Poppins' }}>Upload</Text>

              className="aspect-square border-2 border-emerald-500 rounded-xl items-center justify-center bg-gray-50"
              onPress={handleUpload}
              activeOpacity={0.8}
            >
              <View className="items-center">
                <Text className="text-4xl mb-2">📷</Text>
                <View className="bg-emerald-500 px-6 py-2 rounded-full">
                  <Text className="text-white font-medium font-poppins">Upload</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins', marginBottom: 4 }}>
                  Tap to Scan
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
                  Identify recyclability, carbon savings{'\n'}and get action options
                </Text>
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🛍️</Text>
                <Text style={{ fontSize: 11, color: '#374151', fontFamily: 'Poppins' }}>Eco Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🛒</Text>
                <Text style={{ fontSize: 11, color: '#374151', fontFamily: 'Poppins' }}>My Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>📊</Text>
                <Text style={{ fontSize: 11, color: '#374151', fontFamily: 'Poppins' }}>My Impact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        {scanHistory.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 16 }}>
              Recent Scans
            </Text>
            {scanHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
                onPress={() => router.push('/scan')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 24 }}>{getRecyclableIcon(item.recyclable)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
                      {item.itemName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                      {item.material} • {item.date}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins' }}>
                        {item.carbonSaved}% CO₂
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#6B7280', fontFamily: 'Poppins', marginTop: 4 }}>
                      Saved
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {scanHistory.length === 0 && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🌍</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginBottom: 8 }}>
              Start Scanning!
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
              Scan items to see their recyclability,{'\n'}carbon savings and impact on environment
            </Text>
          </View>
        )}
      </ScrollView>

        {/* Eco Shop Section */}
        <View className="px-4 pt-6 pb-24">
          <Text className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
            Eco Shop
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-20 right-6">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-emerald-500 items-center justify-center shadow-lg"
          onPress={() => router.push('/(tabs)/shop')}
          activeOpacity={0.8}
        >
          <Text className="text-2xl">🛍️</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-6">
        <View className="flex-row justify-between items-center">
          {/* Home - Active */}
          <TouchableOpacity className="items-center">
            <Text className="text-2xl">🏠</Text>
            <Text className="text-xs font-medium text-emerald-500 mt-1 font-poppins">Home</Text>
          </TouchableOpacity>

          {/* Cart - Inactive */}
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text className="text-2xl">🛒</Text>
            <Text className="text-xs font-medium text-gray-400 mt-1 font-poppins">Cart</Text>
          </TouchableOpacity>

          {/* Profile - Inactive */}
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text className="text-2xl">👤</Text>
            <Text className="text-xs font-medium text-gray-400 mt-1 font-poppins">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
