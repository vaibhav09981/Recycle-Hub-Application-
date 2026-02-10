import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
          Cart
        </Text>
      </View>

      {/* Cart Items */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 180 }}>
          {cart.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Product Image */}
              <View style={{ 
                width: 80, 
                height: 80, 
                backgroundColor: '#F3F4F6', 
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 36 }}>{item.image}</Text>
              </View>

              {/* Product Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginBottom: 4 }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', marginBottom: 8 }}>
                  ${item.price.toFixed(2)}
                </Text>

                {/* Quantity Controls */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={{ fontSize: 18, color: '#374151' }}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginHorizontal: 16 }}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: '#10B981',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={{ fontSize: 18, color: '#FFFFFF' }}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ marginLeft: 'auto', padding: 8 }}
                    onPress={() => removeFromCart(item.id)}
                  >
                    <Text style={{ fontSize: 20, color: '#EF4444' }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Cart Summary */}
      <View style={{
        position: 'absolute',
        bottom: 68, // Position above the floating tab bar (60 + 8 margin)
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', fontFamily: 'Poppins' }}>
            Total
          </Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>
            ${cartTotal.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#10B981',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          onPress={() => {
            // TODO: Checkout functionality
            console.log('Checkout pressed');
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, fontFamily: 'Poppins' }}>
            Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
