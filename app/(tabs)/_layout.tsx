import { Tabs } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Text, View, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { useCart } from '@/context/CartContext';
import { useJournal } from '@/context/JournalContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const ScrollContext = createContext<Animated.Value | null>(null);

export function useScroll() {
  return useContext(ScrollContext);
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cartCount } = useCart();
  const { journalCount } = useJournal();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animate tab bar translateY based on scrollY
  const translateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  return (
    <ScrollContext.Provider value={scrollY}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#9CA3AF',
          headerShown: false,
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 65 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 10,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontFamily: 'Poppins',
            fontSize: 10,
            fontWeight: '500',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, size }) => (
              <View>
                <Ionicons name="bag-handle-outline" size={24} color={color} />
                {cartCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                      minWidth: 16,
                      height: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{cartCount}</Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color, size }) => (
              <View>
                <Ionicons name="book-outline" size={24} color={color} />
                {journalCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: '#10B981',
                      borderRadius: 10,
                      minWidth: 16,
                      height: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{journalCount}</Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </ScrollContext.Provider>
  );
}
