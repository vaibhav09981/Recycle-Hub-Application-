import { useAuth } from '@/context/AuthContext';
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
