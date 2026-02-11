import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';

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

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>

        {/* Empty Cart Content */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Start shopping for eco-friendly products and make a difference!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/shop')}
            activeOpacity={0.9}
          >
            <Text style={styles.emptyButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.itemCount}>{cart.length} items</Text>
      </View>

      {/* Cart Items */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartItems}
      >
        {cart.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            {/* Product Image */}
            <View style={styles.productImageContainer}>
              <Image source={item.image} style={styles.productImage} resizeMode="cover" />
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productCategory}>{item.category || 'Product'}</Text>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>

              {/* Quantity Controls */}
              <View style={styles.quantityRow}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityValue}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, styles.quantityButtonPlus]}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quantityButtonText, styles.quantityButtonTextPlus]}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeButtonIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Cart Summary */}
      <View style={styles.summaryContainer}>
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>Free</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.summaryTotalLabel]}>Total</Text>
            <Text style={[styles.summaryValue, styles.summaryTotalValue]}>
              ${cartTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Eco Impact */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>🌱 Your Eco Impact</Text>
          <View style={styles.impactRow}>
            <Text style={styles.impactText}>By ordering these eco-friendly products, you&apos;re helping reduce plastic waste!</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => {
            // TODO: Checkout functionality
            console.log('Checkout pressed');
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        {/* Continue Shopping */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push('/(tabs)/shop')}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cartItems: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  // Cart Item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: COLORS.primaryLight,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productCategory: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonPlus: {
    backgroundColor: COLORS.primary,
  },
  quantityButtonText: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: -2,
  },
  quantityButtonTextPlus: {
    color: '#FFFFFF',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginHorizontal: 14,
  },
  removeButton: {
    padding: 6,
  },
  removeButtonIcon: {
    fontSize: 18,
  },
  // Summary Container
  summaryContainer: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  // Eco Impact Card
  impactCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    lineHeight: 18,
  },
  // Checkout Button
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  // Continue Shopping
  continueButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
});
