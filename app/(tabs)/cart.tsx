import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="px-4 pt-4 pb-3 bg-card">
          <Text className="text-3xl font-bold text-textPrimary font-poppins">Cart</Text>
        </View>

        <View className="flex-1 justify-center items-center px-8">
          <View className="w-30 h-30 rounded-full bg-primaryLight items-center justify-center mb-6">
            <Text className="text-5xl">🛒</Text>
          </View>
          <Text className="text-xl font-semibold text-textPrimary font-poppins mb-2">Your cart is empty</Text>
          <Text className="text-sm text-textSecondary font-poppins text-center mb-6 leading-5">
            Start shopping for eco-friendly products and make a difference!
          </Text>
          <TouchableOpacity className="bg-primary rounded-xl py-3.5 px-8 shadow-lg shadow-primary/40" onPress={() => router.push('/(tabs)/shop')} activeOpacity={0.9}>
            <Text className="text-base font-semibold text-white font-poppins">Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row justify-between items-center px-4 pt-4 pb-3 bg-card">
        <Text className="text-3xl font-bold text-textPrimary font-poppins">Cart</Text>
        <Text className="text-sm text-textSecondary font-poppins">{cart.length} items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 3, paddingBottom: 4 }}>
        {cart.map((item) => (
          <View key={item.id} className="flex-row bg-card rounded-2xl p-3.5 mb-3 shadow-sm">
            <View className="w-20 h-20 rounded-xl overflow-hidden mr-3.5 bg-primaryLight">
              <Image source={item.image} className="w-full h-full" resizeMode="cover" />
            </View>

            <View className="flex-1 justify-center">
              <Text className="text-xs text-primary font-poppins mb-1 font-medium uppercase tracking-wide">{item.category || 'Product'}</Text>
              <Text className="text-base font-semibold text-textPrimary font-poppins mb-1">{item.name}</Text>
              <Text className="text-sm text-textSecondary font-poppins mb-2.5">${item.price.toFixed(2)}</Text>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center bg-background rounded-lg p-1">
                  <TouchableOpacity className="w-8 h-8 rounded-lg bg-card items-center justify-center shadow-sm" onPress={() => updateQuantity(item.id, item.quantity - 1)} activeOpacity={0.8}>
                    <Text className="text-lg font-semibold text-textPrimary -mt-1">−</Text>
                  </TouchableOpacity>
                  <Text className="text-sm font-semibold text-textPrimary font-poppins mx-3.5">{item.quantity}</Text>
                  <TouchableOpacity className="w-8 h-8 rounded-lg bg-primary items-center justify-center shadow-sm" onPress={() => updateQuantity(item.id, item.quantity + 1)} activeOpacity={0.8}>
                    <Text className="text-lg font-semibold text-white -mt-1">+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity className="p-1.5" onPress={() => removeFromCart(item.id)} activeOpacity={0.8}>
                  <Text className="text-lg">🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="bg-card border-t border-border p-4 pb-8">
        <View className="bg-background rounded-xl p-4 mb-3">
          <Text className="text-base font-semibold text-textPrimary font-poppins mb-3">Order Summary</Text>
          
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="text-sm text-textSecondary font-poppins">Subtotal</Text>
            <Text className="text-sm font-medium text-textPrimary font-poppins">${cartTotal.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="text-sm text-textSecondary font-poppins">Shipping</Text>
            <Text className="text-sm font-medium text-primary">Free</Text>
          </View>
          
          <View className="h-px bg-border my-2.5" />
          
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-textPrimary font-poppins">Total</Text>
            <Text className="text-xl font-bold text-primary font-poppins">${cartTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View className="bg-primaryLight rounded-xl p-3.5 mb-3">
          <Text className="text-sm font-semibold text-primaryDark font-poppins mb-1.5">🌱 Your Eco Impact</Text>
          <Text className="text-xs text-textSecondary font-poppins leading-[18px]">By ordering these eco-friendly products, you&apos;re helping reduce plastic waste!</Text>
        </View>

        <TouchableOpacity className="bg-primary rounded-xl py-4 items-center shadow-lg shadow-primary/40 mb-3" onPress={() => console.log('Checkout pressed')} activeOpacity={0.9}>
          <Text className="text-base font-semibold text-white font-poppins">Proceed to Checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3 items-center" onPress={() => router.push('/(tabs)/shop')} activeOpacity={0.8}>
          <Text className="text-sm font-medium text-primary font-poppins">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
