import React from 'react';

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
          Cart
        </Text>
      </View>

      {/* Empty Cart Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🛒</Text>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginBottom: 8 }}>
          Your cart is empty
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center', paddingHorizontal: 32 }}>
          Start shopping for eco-friendly products and make a difference!
        </Text>
import { SafeAreaView, StatusBar, Text, View } from 'react-native';

export default function CartScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-4xl mb-4">🛒</Text>
        <Text className="text-xl font-semibold text-gray-900 font-poppins">Cart</Text>
        <Text className="text-gray-500 mt-2 font-poppins">Your cart is empty</Text>
      </View>
    </SafeAreaView>
  );
}
