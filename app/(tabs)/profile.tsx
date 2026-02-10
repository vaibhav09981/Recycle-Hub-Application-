import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();
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

    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
          Profile
        </Text>
      </View>

      {/* Profile Content */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 50, 
            backgroundColor: '#10B981', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Text style={{ fontSize: 40, color: '#FFFFFF' }}>
              {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
            {session?.user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', marginTop: 4 }}>
            {session?.user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>Scanned</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>Rewards</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>Orders</Text>
          </View>
        </View>

        {/* Logout Button */}
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
