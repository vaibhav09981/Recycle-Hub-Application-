import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();

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
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
