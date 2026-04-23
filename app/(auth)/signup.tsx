import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    } else {
      Alert.alert('Success', 'Account created successfully! Please check your email to verify.');
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
        <View className="flex-1 px-8 py-10">
          <View className="mb-4">
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity className="flex-row items-center py-2" onPress={() => Haptics.selectionAsync()}>
                <Ionicons name="arrow-back" size={20} color="#10B981" />
                <Text className="text-base text-primary font-bold font-poppins ml-1">Back</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View className="items-center mb-10">
            <View className="p-5 bg-white rounded-[32px] shadow-sm border border-slate-100 mb-6">
              <Image 
                source={require('@/assets/recyclehub_icon.png')} 
                className="w-24 h-24" 
                resizeMode="contain" 
              />
            </View>
            <View className="flex-row items-center mb-1">
              <Text className="text-3xl font-bold text-primary font-poppins">Recycle</Text>
              <Text className="text-3xl font-bold text-textPrimary font-poppins">Hub</Text>
            </View>
            <Text className="text-sm text-textSecondary font-poppins text-center">Join the community helping the planet</Text>
          </View>

          <View className="w-full">
            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-textPrimary mb-1 ml-1 font-poppins">Full Name</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                <Ionicons name="person-outline" size={18} color="#94A3B8" />
                <TextInput
                  className="flex-1 p-3 text-base text-textPrimary font-poppins"
                  placeholder="John Doe"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-textPrimary mb-1 ml-1 font-poppins">Email Address</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                <Ionicons name="mail-outline" size={18} color="#94A3B8" />
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

            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-textPrimary mb-1 ml-1 font-poppins">Password</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                <TextInput
                  className="flex-1 p-3 text-base text-textPrimary font-poppins"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[13px] font-semibold text-textPrimary mb-1 ml-1 font-poppins">Confirm Password</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                <Ionicons name="checkmark-circle-outline" size={18} color="#94A3B8" />
                <TextInput
                  className="flex-1 p-3 text-base text-textPrimary font-poppins"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              className="w-full p-4 bg-primary rounded-2xl items-center shadow-lg shadow-primary/20 mt-2" 
              onPress={handleSignup} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-lg font-bold text-white font-poppins">{loading ? 'Creating Account...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-8 mb-10">
              <Text className="text-sm text-textSecondary font-poppins">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity onPress={() => Haptics.selectionAsync()}>
                  <Text className="text-sm text-primary font-bold font-poppins">Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
