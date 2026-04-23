import { useCart } from '@/context/CartContext';
import { useCredits } from '@/context/CreditsContext';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Product {
  id: number;
  name: string;
  price: number;
  image: any;
  category: string;
  ecoRating: number;
  description: string;
  reviews: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  credits: number;
  discount: number;
  icon: string;
  color: string;
}

const rewards: Reward[] = [
  { id: 'r1', title: '₹50 Discount', description: 'Redeem for any product', credits: 100, discount: 50, icon: 'ticket', color: '#10B981' },
  { id: 'r2', title: '₹150 Discount', description: 'Best for bigger carts', credits: 300, discount: 150, icon: 'gift', color: '#3B82F6' },
  { id: 'r3', title: '₹500 Mega Deal', description: 'Exclusive for Eco Pro', credits: 1000, discount: 500, icon: 'trophy', color: '#8B5CF6' },
  { id: 'r4', title: 'Free Shipping', description: 'Unlimited distance', credits: 200, discount: 0, icon: 'airplane', color: '#F59E0B' },
];

const products: Product[] = [
  { id: 1, name: 'Bamboo Toothbrush', price: 99, image: require('@/assets/ecoshop/Bamboo Toothbrush.jpeg'), category: 'Personal Care', ecoRating: 5, description: 'Eco-friendly bamboo toothbrush with charcoal bristles. Biodegradable handle made from sustainably sourced bamboo.', reviews: 128 },
  { id: 2, name: 'Reusable Water Bottle', price: 499, image: require('@/assets/ecoshop/Reusble Water Bottle.jpeg'), category: 'Home', ecoRating: 5, description: 'Stainless steel water bottle with triple insulation. Keeps drinks cold for 24 hours or hot for 12 hours.', reviews: 256 },
  { id: 3, name: 'Organic Cotton Bag', price: 199, image: require('@/assets/ecoshop/Organic Cotton Bag.jpeg'), category: 'Accessories', ecoRating: 4, description: 'Heavy-duty organic cotton tote bag. Replaces hundreds of plastic bags over its lifetime.', reviews: 89 },
  { id: 4, name: 'Solar Power Bank', price: 1499, image: require('@/assets/ecoshop/Solar Power Bank.jpeg'), category: 'Electronics', ecoRating: 4, description: '20000mAh power bank with solar charging panel. Charge your devices anywhere with clean energy.', reviews: 167 },
  { id: 5, name: 'Eco-friendly Phone Case', price: 399, image: require('@/assets/ecoshop/Eco-Friendly Phone Case.jpeg'), category: 'Accessories', ecoRating: 4, description: 'Biodegradable phone case made from plant-based materials. Drop protection up to 6 feet.', reviews: 203 },
  { id: 6, name: 'Bamboo Cutlery Set', price: 299, image: require('@/assets/ecoshop/Bamboo Cutlery Set.jpeg'), category: 'Kitchen', ecoRating: 5, description: 'Portable bamboo fork, spoon, knife, and chopsticks with carry case. Perfect for travel and lunch.', reviews: 145 },
  { id: 7, name: 'Natural Soap Bar', price: 149, image: require('@/assets/ecoshop/Natural Soap Bar.jpeg'), category: 'Personal Care', ecoRating: 5, description: 'Handmade soap with natural ingredients. No parabens, no sulfates, no artificial fragrances.', reviews: 312 },
  { id: 8, name: 'Recycled Notebooks', price: 199, image: require('@/assets/ecoshop/Recycled Notebooks.jpeg'), category: 'Stationery', ecoRating: 4, description: 'Notebooks made from 100% recycled paper. 80 lined pages with recycled cardboard covers.', reviews: 78 },
];

const categories = ['All', 'Personal Care', 'Home', 'Kitchen', 'Accessories', 'Stationery', 'Electronics'];

const renderStars = (rating: number, size: number = 12) => (
  <View className="flex-row mb-2">
    {Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={size} color={i < rating ? '#F59E0B' : '#E5E7EB'} style={{ marginRight: 1 }} />
    ))}
  </View>
);

import { useRouter } from 'expo-router';

export default function ShopScreen() {
  const router = useRouter();
  const { addMultipleToCart } = useCart();
  const { greenCredits, spendCredits } = useCredits();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const openProduct = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addMultipleToCart({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        category: selectedProduct.category,
      }, quantity);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeProduct();
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    Haptics.selectionAsync();
    Alert.alert(
      'Redeem Reward?',
      `Spend ${reward.credits} Green Credits for a ${reward.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          onPress: async () => {
            const success = await spendCredits(reward.credits);
            if (success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Reward Redeemed!', `You've got a ${reward.title}. The discount code has been copied to your clipboard (Simulation).`);
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Insufficient Credits', `You need ${reward.credits - greenCredits} more Green Credits to redeem this reward.`);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header with Balance */}
      <View className="px-4 pt-4 pb-2 bg-white border-b border-slate-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-900 font-poppins">Eco Shop</Text>
        <View className="flex-row items-center bg-teal/5 px-3 py-1.5 rounded-full border border-teal/20">
          <Ionicons name="sparkles" size={14} color="#14B8A6" />
          <Text className="text-sm font-black text-teal font-poppins ml-2">{greenCredits}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Rewards Section */}
        <View className="py-6">
          <View className="px-5 mb-4 flex-row justify-between items-end">
            <View>
              <Text className="text-[10px] font-black text-earth uppercase tracking-[4px] mb-1">Exclusive Rewards</Text>
              <Text className="text-lg font-bold text-slate-900 font-poppins">Redeem Your Credits</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
               <Text className="text-xs font-bold text-teal">Earn More</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {rewards.map((reward) => (
              <TouchableOpacity
                key={reward.id}
                className="w-44 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
                onPress={() => handleRedeemReward(reward)}
                activeOpacity={0.9}
              >
                <View className="w-10 h-10 rounded-2xl bg-teal/5 items-center justify-center mb-4">
                  <Ionicons name={reward.icon as any} size={20} color="#14B8A6" />
                </View>
                <Text className="text-sm font-extrabold text-slate-900 font-poppins mb-1">{reward.title}</Text>
                <Text className="text-[10px] text-slate-500 font-poppins mb-3 leading-4">{reward.description}</Text>
                <View className="flex-row items-center bg-earth/5 self-start px-2 py-1 rounded-lg">
                  <Text className="text-[10px] font-black text-earth">{reward.credits} GC</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View className="px-5 mt-2">
          <Text className="text-[10px] font-black text-earth uppercase tracking-[4px] mb-4">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 15 }}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-5 py-3 rounded-2xl border ${selectedCategory === category ? 'bg-teal border-teal' : 'bg-white border-slate-100'}`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(category);
                }}
                activeOpacity={0.8}
              >
                <Text className={`text-xs font-bold font-poppins ${selectedCategory === category ? 'text-white' : 'text-slate-500'}`}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Grid */}
        <View className="flex-row flex-wrap px-6 pt-6 justify-between">
          {filteredProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              className="w-[48%] bg-white rounded-[32px] p-4 mb-5 shadow-sm border border-slate-100" 
              onPress={() => openProduct(product)}
            >
              <View className="w-full aspect-square rounded-[24px] overflow-hidden mb-4 bg-emerald-50">
                <Image source={product.image} className="w-full h-full" resizeMode="cover" />
                <View className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center backdrop-blur-md shadow-sm">
                  <Ionicons name="leaf" size={14} color="#10B981" />
                </View>
              </View>
              <View>
                <Text className="text-[10px] text-emerald-600 font-bold font-poppins mb-1 uppercase tracking-widest">{product.category}</Text>
                <Text className="text-sm font-bold text-slate-900 font-poppins leading-5 mb-2" numberOfLines={2}>{product.name}</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-lg font-extrabold text-slate-900 font-poppins">₹{product.price.toFixed(0)}</Text>
                  <Text className="text-[10px] text-slate-400 font-poppins ml-1.5 line-through">₹{(product.price * 1.5).toFixed(0)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View className="h-40" />
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent>
        <View className="flex-1 bg-black/50">
          <View className="absolute bottom-0 left-0 right-0 h-[85%] bg-white rounded-t-[40px] overflow-hidden">
            {selectedProduct && (
              <>
                <View className="flex-row items-center justify-between p-6 border-b border-slate-50">
                  <TouchableOpacity onPress={closeProduct} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold text-slate-900 font-poppins">Product Details</Text>
                  <View className="w-10" />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="w-full h-80">
                    <Image source={selectedProduct.image} className="w-full h-full" resizeMode="cover" />
                  </View>

                  <View className="p-8">
                    <View className="flex-row items-center justify-between mb-2">
                       <Text className="text-xs text-emerald-600 font-bold uppercase tracking-widest font-poppins">{selectedProduct.category}</Text>
                       <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-lg">
                          <Ionicons name="star" size={12} color="#059669" />
                          <Text className="text-[10px] font-bold text-emerald-700 ml-1">Top Rated</Text>
                       </View>
                    </View>
                    
                    <Text className="text-3xl font-bold text-slate-900 font-poppins leading-9">{selectedProduct.name}</Text>

                    <View className="flex-row items-center mt-3 mb-6">
                      {renderStars(selectedProduct.ecoRating, 16)}
                      <Text className="text-sm text-slate-400 ml-3 font-poppins">({selectedProduct.reviews} reviews)</Text>
                    </View>

                    <View className="bg-slate-50 rounded-[32px] p-6 mb-8 flex-row items-center justify-between">
                       <View>
                          <Text className="text-xs text-slate-400 font-poppins">Price</Text>
                          <Text className="text-4xl font-extrabold text-slate-900 font-poppins">₹{selectedProduct.price.toFixed(0)}</Text>
                       </View>
                       <View className="flex-row items-center bg-white rounded-2xl p-2 border border-slate-100">
                          <TouchableOpacity 
                            className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center" 
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setQuantity(Math.max(1, quantity - 1));
                            }}
                          >
                            <Ionicons name="remove" size={20} color="#64748B" />
                          </TouchableOpacity>
                          <Text className="text-xl font-bold text-slate-900 w-12 text-center font-poppins">{quantity}</Text>
                          <TouchableOpacity 
                            className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center" 
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setQuantity(quantity + 1);
                            }}
                          >
                            <Ionicons name="add" size={20} color="#64748B" />
                          </TouchableOpacity>
                       </View>
                    </View>

                    <Text className="text-lg font-bold text-slate-900 mb-3 font-poppins">About Product</Text>
                    <Text className="text-sm text-slate-500 leading-6 font-poppins mb-10">{selectedProduct.description}</Text>
                  </View>
                </ScrollView>

                <View className="p-8 pt-0 border-t border-slate-50 bg-white">
                  <View className="flex-row items-center justify-between mb-6 pt-6">
                     <View>
                        <Text className="text-[10px] text-slate-400 font-bold font-poppins uppercase tracking-widest">Grand Total</Text>
                        <Text className="text-2xl font-bold text-emerald-600 font-poppins">₹{(selectedProduct.price * quantity).toFixed(0)}</Text>
                     </View>
                     <Text className="text-xs text-slate-300 font-poppins">+ Free Shipping</Text>
                  </View>
                  <TouchableOpacity 
                    className="bg-emerald-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200" 
                    onPress={handleAddToCart}
                  >
                    <Text className="text-lg font-bold text-white font-poppins">Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
