import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Profile</Text>
        
        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="ml-4">
              <Text className="text-lg font-semibold text-gray-900 font-poppins">
                {user?.email || 'User'}
              </Text>
              <Text className="text-gray-500 font-poppins">View Profile</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-red-500 py-4 rounded-xl items-center mt-auto mb-6"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold font-poppins">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
