import { useCart } from '@/context/CartContext';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Colors
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

export default function ShopScreen() {
  const { addToCart, addMultipleToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const renderStars = (rating: number, size: number = 12) => (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text key={i} style={[styles.star, { fontSize: size }, i < rating && styles.starActive]}>★</Text>
      ))}
    </View>
  );

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eco Shop</Text>
        <Text style={styles.headerSubtitle}>Sustainable products for a better planet</Text>
      </View>

      {/* Category Navbar */}
      <View style={styles.categoryNavbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryTabText, selectedCategory === cat && styles.categoryTabTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => openProduct(product)}>
              <View style={styles.productImageContainer}>
                <Image source={product.image} style={styles.productImage} resizeMode="cover" />
                <View style={styles.ecoBadge}><Text style={styles.ecoBadgeText}>🌱</Text></View>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                {renderStars(product.ecoRating, 10)}
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  <View style={styles.addCircle}><Text style={styles.addText}>+</Text></View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent onRequestClose={closeProduct}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={closeProduct}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
                  <Text style={styles.modalTitle}>Product Details</Text>
                  <View style={styles.modalHeaderRight} />
                </View>

                <ScrollView style={styles.modalScroll}>
                  {/* Image */}
                  <View style={styles.modalImageContainer}>
                    <Image source={selectedProduct.image} style={styles.modalImage} resizeMode="cover" />
                  </View>

                  {/* Info */}
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalCategory}>{selectedProduct.category}</Text>
                    <Text style={styles.modalName}>{selectedProduct.name}</Text>
                    
                    {/* Rating & Reviews */}
                    <View style={styles.ratingRow}>
                      {renderStars(selectedProduct.ecoRating, 16)}
                      <Text style={styles.reviewText}>({selectedProduct.reviews} reviews)</Text>
                    </View>

                    {/* Price */}
                    <Text style={styles.modalPrice}>${selectedProduct.price.toFixed(2)}</Text>

                    <View style={styles.divider} />

                    {/* Description */}
                    <Text style={styles.sectionLabel}>Description</Text>
                    <Text style={styles.description}>{selectedProduct.description}</Text>

                    <View style={styles.divider} />

                    {/* Quantity Selector */}
                    <Text style={styles.sectionLabel}>Quantity</Text>
                    <View style={styles.quantityRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                      <Text style={styles.totalPrice}>Total: ${(selectedProduct.price * quantity).toFixed(2)}</Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Add to Cart Button */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                    <Text style={styles.addToCartText}>Add to Cart</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'Poppins' },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, fontFamily: 'Poppins', marginTop: 4 },
  categoryNavbar: { backgroundColor: COLORS.card, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  categoryList: { paddingHorizontal: 16, gap: 8 },
  categoryTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  categoryTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryTabText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, fontFamily: 'Poppins' },
  categoryTabTextActive: { color: '#FFFFFF' },
  scrollView: { flex: 1 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  productCard: { width: '47%', backgroundColor: COLORS.card, borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImageContainer: { width: '100%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 10, backgroundColor: COLORS.primaryLight },
  productImage: { width: '100%', height: '100%' },
  ecoBadge: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  ecoBadgeText: { fontSize: 12 },
  productInfo: { paddingHorizontal: 2 },
  productCategory: { fontSize: 10, color: COLORS.primary, fontFamily: 'Poppins', marginBottom: 2, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, fontFamily: 'Poppins', marginBottom: 6 },
  starsRow: { flexDirection: 'row', marginBottom: 8 },
  star: { fontSize: 12, color: COLORS.border, marginRight: 1 },
  starActive: { color: COLORS.warning },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: 18, fontWeight: '700', color: COLORS.primary, fontFamily: 'Poppins' },
  addCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 18, color: '#FFFFFF', fontWeight: '600', marginTop: -2 },
  bottomSpacer: { height: 100 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85%', backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  closeBtn: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  modalHeaderRight: { width: 32 },
  modalScroll: { maxHeight: '85%' },
  modalImageContainer: { width: '100%', height: 250, backgroundColor: COLORS.background },
  modalImage: { width: '100%', height: '100%' },
  modalInfo: { padding: 16 },
  modalCategory: { fontSize: 12, color: COLORS.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  modalName: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4, fontFamily: 'Poppins' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  reviewText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 8 },
  modalPrice: { fontSize: 26, fontWeight: '700', color: COLORS.primary, marginTop: 12, fontFamily: 'Poppins' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  qtyBtnText: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  qtyValue: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, minWidth: 40, textAlign: 'center' },
  totalPrice: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginLeft: 'auto' },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  addToCartBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  addToCartText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Poppins' },
});
