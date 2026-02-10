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
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
