import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Colors from UI/UX Guide
const COLORS = {
  primary: '#10B981',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#22C55E',
  info: '#3B82F6',
};

interface Product {
  id: number;
  name: string;
  price: number;
  image: any;
  category: string;
  ecoRating: number;
}

const products: Product[] = [
  { id: 1, name: 'Bamboo Toothbrush', price: 5.99, image: require('@/assets/ecoshop/Bamboo Toothbrush.jpeg'), category: 'Personal Care', ecoRating: 5 },
  { id: 2, name: 'Reusable Water Bottle', price: 24.99, image: require('@/assets/ecoshop/Reusble Water Bottle.jpeg'), category: 'Home', ecoRating: 5 },
  { id: 3, name: 'Organic Cotton Bag', price: 12.99, image: require('@/assets/ecoshop/Organic Cotton Bag.jpeg'), category: 'Accessories', ecoRating: 4 },
  { id: 4, name: 'Solar Power Bank', price: 49.99, image: require('@/assets/ecoshop/Solar Power Bank.jpeg'), category: 'Electronics', ecoRating: 4 },
  { id: 5, name: 'Eco-friendly Phone Case', price: 19.99, image: require('@/assets/ecoshop/Eco-Friendly Phone Case.jpeg'), category: 'Accessories', ecoRating: 4 },
  { id: 6, name: 'Bamboo Cutlery Set', price: 15.99, image: require('@/assets/ecoshop/Bamboo Cutlery Set.jpeg'), category: 'Kitchen', ecoRating: 5 },
  { id: 7, name: 'Natural Soap Bar', price: 6.99, image: require('@/assets/ecoshop/Natural Soap Bar.jpeg'), category: 'Personal Care', ecoRating: 5 },
  { id: 8, name: 'Recycled Notebooks', price: 8.99, image: require('@/assets/ecoshop/Recycled Notebooks.jpeg'), category: 'Stationery', ecoRating: 4 },
];

const categories = ['All', 'Personal Care', 'Home', 'Kitchen', 'Accessories', 'Stationery', 'Electronics'];

export default function ShopScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const renderEcoStars = (rating: number) => {
    return (
      <View style={styles.ecoStars}>
        {Array.from({ length: 5 }, (_, i) => (
          <Text key={i} style={[styles.ecoStar, i < rating && styles.ecoStarActive]}>
            ★
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eco Shop</Text>
        <Text style={styles.headerSubtitle}>Sustainable products for a better planet</Text>
      </View>

      {/* Category Navbar */}
      <View style={styles.categoryNavbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryTab, selectedCategory === category && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryTabText, selectedCategory === category && styles.categoryTabTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productGrid}
      >
        {filteredProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => {
              console.log('Product pressed:', product.name);
            }}
            activeOpacity={0.9}
          >
            {/* Product Image */}
            <View style={styles.productImageContainer}>
              <Image source={product.image} style={styles.productImage} resizeMode="cover" />
              <View style={styles.ecoBadge}>
                <Text style={styles.ecoBadgeText}>🌱</Text>
              </View>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              {renderEcoStars(product.ecoRating)}

              {/* Price and Add Button */}
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(product as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Coming Soon Message */}
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonText}>many more to come</Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  // Category Navbar
  categoryNavbar: {
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  // Product Card
  productCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: COLORS.primaryLight,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  ecoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ecoBadgeText: {
    fontSize: 12,
  },
  productInfo: {
    paddingHorizontal: 2,
  },
  productCategory: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  ecoStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ecoStar: {
    fontSize: 10,
    color: COLORS.border,
    marginRight: 1,
  },
  ecoStarActive: {
    color: COLORS.warning,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: -2,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 120,
  },
  comingSoonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
});
