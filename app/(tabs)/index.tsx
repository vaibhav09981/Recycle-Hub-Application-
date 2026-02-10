import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
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

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleUpload = () => {
    // TODO: Implement image upload/camera
    console.log('Upload pressed');
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

        {/* Greeting & Stats Section */}

        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
            Good Morning
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>0</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#10B981', marginLeft: 8, fontFamily: 'Poppins' }}>
              Items Scanned
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontFamily: 'Poppins' }}>{currentDate}</Text>
        </View>

        {/* Main Card: Scan Item */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 80 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
            {/* Card Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
