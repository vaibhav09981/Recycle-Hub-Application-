import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const products: Product[] = [
  { id: 1, name: 'Bamboo Toothbrush', price: 5.99, image: '🪥', category: 'Personal Care' },
  { id: 2, name: 'Reusable Water Bottle', price: 24.99, image: '🍶', category: 'Home' },
  { id: 3, name: 'Organic Cotton Bag', price: 12.99, image: '👜', category: 'Accessories' },
  { id: 4, name: 'Solar Power Bank', price: 49.99, image: '🔋', category: 'Electronics' },
  { id: 5, name: 'Eco-friendly Phone Case', price: 19.99, image: '📱', category: 'Accessories' },
  { id: 6, name: 'Bamboo Cutlery Set', price: 15.99, image: '🍴', category: 'Kitchen' },
  { id: 7, name: 'Natural Soap Bar', price: 6.99, image: '🧼', category: 'Personal Care' },
  { id: 8, name: 'Recycled Notebooks', price: 8.99, image: '📓', category: 'Stationery' },
];

export default function ShopScreen() {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
          Eco Shop
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', marginTop: 4 }}>
          Sustainable products for a better planet
        </Text>
      </View>

      {/* Product Grid */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 80 }}>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={{
                width: '48%',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => {
                // Navigate to product details
                console.log('Product pressed:', product.name);
              }}
            >
              {/* Product Image Placeholder */}
              <View style={{ 
                width: '100%', 
                aspectRatio: 1, 
                backgroundColor: '#F3F4F6', 
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 48 }}>{product.image}</Text>
              </View>

              {/* Product Info */}
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginBottom: 4 }}>
                {product.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins', marginBottom: 8 }}>
                {product.category}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>
                ${product.price.toFixed(2)}
              </Text>

              {/* Add to Cart Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#10B981',
                  borderRadius: 8,
                  paddingVertical: 8,
                  alignItems: 'center',
                  marginTop: 12,
                }}
                onPress={() => {
                  addToCart(product);
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Poppins', fontSize: 12 }}>
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
