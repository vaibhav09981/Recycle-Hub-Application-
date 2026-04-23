import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } else {
      router.replace('/' as any);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-12">
          <View className="items-center mb-10">
            <View className="p-5 bg-white rounded-[32px] shadow-sm border border-slate-100 mb-6 mt-10">
              <Image 
                source={require('@/assets/recyclehub_icon.png')} 
                className="w-24 h-24" 
                resizeMode="contain" 
              />
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-4xl font-bold text-primary font-poppins">Recycle</Text>
              <Text className="text-4xl font-bold text-textPrimary font-poppins">Hub</Text>
            </View>
            <Text className="text-base text-textSecondary font-poppins text-center px-4">Your companion for a cleaner planet</Text>
          </View>

          <View className="w-full">
            <View className="mb-5">
              <Text className="text-[13px] font-semibold text-textPrimary mb-2 ml-1 font-poppins">Email Address</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                <TextInput
                  className="flex-1 p-3 text-base text-textPrimary font-poppins"
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[13px] font-semibold text-textPrimary mb-2 ml-1 font-poppins">Password</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                <TextInput
                  className="flex-1 p-3 text-base text-textPrimary font-poppins"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              className="w-full p-4 bg-primary rounded-2xl items-center shadow-lg shadow-primary/20 mt-4" 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-lg font-bold text-white font-poppins">{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10">
              <Text className="text-sm text-textSecondary font-poppins">Don&apos;t have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity onPress={() => Haptics.selectionAsync()}>
                  <Text className="text-sm text-primary font-bold font-poppins">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
