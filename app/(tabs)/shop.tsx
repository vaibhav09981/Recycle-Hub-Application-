import { useCart } from '@/context/CartContext';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const products: Product[] = [
  { id: 1, name: 'Bamboo Toothbrush', price: 5.99, image: require('@/assets/ecoshop/Bamboo Toothbrush.jpeg'), category: 'Personal Care', ecoRating: 5, description: 'Eco-friendly bamboo toothbrush with charcoal bristles. Biodegradable handle made from sustainably sourced bamboo.', reviews: 128 },
  { id: 2, name: 'Reusable Water Bottle', price: 24.99, image: require('@/assets/ecoshop/Reusble Water Bottle.jpeg'), category: 'Home', ecoRating: 5, description: 'Stainless steel water bottle with triple insulation. Keeps drinks cold for 24 hours or hot for 12 hours.', reviews: 256 },
  { id: 3, name: 'Organic Cotton Bag', price: 12.99, image: require('@/assets/ecoshop/Organic Cotton Bag.jpeg'), category: 'Accessories', ecoRating: 4, description: 'Heavy-duty organic cotton tote bag. Replaces hundreds of plastic bags over its lifetime.', reviews: 89 },
  { id: 4, name: 'Solar Power Bank', price: 49.99, image: require('@/assets/ecoshop/Solar Power Bank.jpeg'), category: 'Electronics', ecoRating: 4, description: '20000mAh power bank with solar charging panel. Charge your devices anywhere with clean energy.', reviews: 167 },
  { id: 5, name: 'Eco-friendly Phone Case', price: 19.99, image: require('@/assets/ecoshop/Eco-Friendly Phone Case.jpeg'), category: 'Accessories', ecoRating: 4, description: 'Biodegradable phone case made from plant-based materials. Drop protection up to 6 feet.', reviews: 203 },
  { id: 6, name: 'Bamboo Cutlery Set', price: 15.99, image: require('@/assets/ecoshop/Bamboo Cutlery Set.jpeg'), category: 'Kitchen', ecoRating: 5, description: 'Portable bamboo fork, spoon, knife, and chopsticks with carry case. Perfect for travel and lunch.', reviews: 145 },
  { id: 7, name: 'Natural Soap Bar', price: 6.99, image: require('@/assets/ecoshop/Natural Soap Bar.jpeg'), category: 'Personal Care', ecoRating: 5, description: 'Handmade soap with natural ingredients. No parabens, no sulfates, no artificial fragrances.', reviews: 312 },
  { id: 8, name: 'Recycled Notebooks', price: 8.99, image: require('@/assets/ecoshop/Recycled Notebooks.jpeg'), category: 'Stationery', ecoRating: 4, description: 'Notebooks made from 100% recycled paper. 80 lined pages with recycled cardboard covers.', reviews: 78 },
];

const categories = ['All', 'Personal Care', 'Home', 'Kitchen', 'Accessories', 'Stationery', 'Electronics'];

const renderStars = (rating: number, size: number = 12) => (
  <View className="flex-row mb-2">
    {Array.from({ length: 5 }, (_, i) => (
      <Text key={i} className={`${i < rating ? 'text-warning' : 'text-border'}`} style={{ fontSize: size, marginRight: 1 }}>★</Text>
    ))}
  </View>
);

export default function ShopScreen() {
  const { addMultipleToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const openProduct = (product: Product) => {
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
      closeProduct();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-3xl font-bold text-textPrimary font-poppins">Eco Shop</Text>
        <Text className="text-sm text-textSecondary font-poppins mt-1">Sustainable products for a better planet</Text>
      </View>

      {/* Category Navbar */}
      <View className="bg-card py-3 border-b border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 2 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`px-4 py-2 rounded-lg ${selectedCategory === cat ? 'bg-primary' : 'bg-background border border-border'}`}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text className={`text-sm font-medium ${selectedCategory === cat ? 'text-white' : 'text-textSecondary'} font-poppins`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap px-4 pt-4 gap-3">
          {filteredProducts.map((product) => (
            <TouchableOpacity key={product.id} className="w-[47%] bg-card rounded-2xl p-3 shadow-sm" onPress={() => openProduct(product)}>
              <View className="w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-primaryLight">
                <Image source={product.image} className="w-full h-full" resizeMode="cover" />
                <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white items-center justify-center">
                  <Text className="text-xs">🌱</Text>
                </View>
              </View>
              <View>
                <Text className="text-[10px] text-primary font-poppins mb-0.5 font-medium uppercase tracking-wide">{product.category}</Text>
                <Text className="text-sm font-semibold text-textPrimary font-poppins mb-1.5" numberOfLines={2}>{product.name}</Text>
                {renderStars(product.ecoRating, 10)}
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-lg font-bold text-primary font-poppins">${product.price.toFixed(2)}</Text>
                  <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                    <Text className="text-lg text-white font-semibold -mt-1">+</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View className="h-24" />
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent onRequestClose={closeProduct}>
        <View className="flex-1 bg-black/50">
          <View className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-white rounded-t-3xl overflow-hidden">
            {selectedProduct && (
              <>
                <View className="flex-row items-center justify-between p-4 border-b border-border">
                  <TouchableOpacity onPress={closeProduct}><Text className="text-xl text-textSecondary p-1">✕</Text></TouchableOpacity>
                  <Text className="text-lg font-semibold text-textPrimary">Product Details</Text>
                  <View className="w-8" />
                </View>

                <ScrollView className="max-h-[85%]">
                  <View className="w-full h-64 bg-background">
                    <Image source={selectedProduct.image} className="w-full h-full" resizeMode="cover" />
                  </View>

                  <View className="p-4">
                    <Text className="text-xs text-primary font-semibold uppercase tracking-wide font-poppins">{selectedProduct.category}</Text>
                    <Text className="text-2xl font-bold text-textPrimary font-poppins mt-1">{selectedProduct.name}</Text>

                    <View className="flex-row items-center mt-2">
                      {renderStars(selectedProduct.ecoRating, 16)}
                      <Text className="text-sm text-textSecondary ml-2">({selectedProduct.reviews} reviews)</Text>
                    </View>

                    <Text className="text-3xl font-bold text-primary font-poppins mt-3">${selectedProduct.price.toFixed(2)}</Text>

                    <View className="h-px bg-border my-4" />

                    <Text className="text-sm font-semibold text-textPrimary mb-2">Description</Text>
                    <Text className="text-sm text-textSecondary leading-6 font-poppins">{selectedProduct.description}</Text>

                    <View className="h-px bg-border my-4" />

                    <Text className="text-sm font-semibold text-textPrimary mb-2">Quantity</Text>
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity className="w-10 h-10 rounded-lg bg-background border border-border items-center justify-center" onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Text className="text-xl font-semibold text-textPrimary">-</Text>
                      </TouchableOpacity>
                      <Text className="text-lg font-semibold text-textPrimary w-10 text-center">{quantity}</Text>
                      <TouchableOpacity className="w-10 h-10 rounded-lg bg-background border border-border items-center justify-center" onPress={() => setQuantity(quantity + 1)}>
                        <Text className="text-xl font-semibold text-textPrimary">+</Text>
                      </TouchableOpacity>
                      <Text className="text-base font-semibold text-primary ml-auto">Total: ${(selectedProduct.price * quantity).toFixed(2)}</Text>
                    </View>
                  </View>
                </ScrollView>

                <View className="p-4 border-t border-border">
                  <TouchableOpacity className="bg-primary py-4 rounded-xl items-center" onPress={handleAddToCart}>
                    <Text className="text-base font-bold text-white font-poppins">Add to Cart</Text>
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
