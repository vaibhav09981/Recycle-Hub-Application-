import React from 'react';
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
