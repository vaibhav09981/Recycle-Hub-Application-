import { useCarbon } from '@/context/CarbonContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Material emission factors (kg CO2 per kg)
const EMISSION_FACTORS = {
  'PET (Plastic bottles)': { factor: 3.4, category: 'plastic', stdWeight: 0.025 },
  'HDPE (Milk jugs)': { factor: 1.9, category: 'plastic', stdWeight: 0.06 },
  'PVC': { factor: 2.2, category: 'plastic', stdWeight: 0.1 },
  'Plastic bags': { factor: 2.0, category: 'plastic', stdWeight: 0.005 },
  'Styrofoam': { factor: 3.6, category: 'plastic', stdWeight: 0.01 },
  'Aluminum (cans)': { factor: 9.0, category: 'metal', stdWeight: 0.015 },
  'Steel (tin cans)': { factor: 2.3, category: 'metal', stdWeight: 0.05 },
  'Cardboard': { factor: 0.9, category: 'paper', stdWeight: 0.2 },
  'Mixed paper': { factor: 1.1, category: 'paper', stdWeight: 0.005 },
  'Newspaper': { factor: 0.7, category: 'paper', stdWeight: 0.25 },
  'Glass bottles': { factor: 0.8, category: 'glass', stdWeight: 0.2 },
  'Food waste': { factor: 0.5, category: 'organic', stdWeight: 0.5 },
  'Garden waste': { factor: 0.3, category: 'organic', stdWeight: 1.0 },
  'Electronics': { factor: 150, category: 'ewaste', stdWeight: 2.0 },
  'Batteries': { factor: 10, category: 'ewaste', stdWeight: 0.05 },
};

const MATERIALS = Object.keys(EMISSION_FACTORS);

export default function FootprintScreen() {
  const router = useRouter();
  const { addFootprint } = useCarbon();
  const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIALS[0]);
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [inputMode, setInputMode] = useState<'weight' | 'count'>('weight');
  const [result, setResult] = useState<{ emissions: number; weightUsed: number; equivalent: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const calculateFootprint = () => {
    const materialData = EMISSION_FACTORS[selectedMaterial as keyof typeof EMISSION_FACTORS];
    const factor = materialData.factor;

    let weightToUse = 0;
    if (inputMode === 'weight') {
      weightToUse = parseFloat(weight) || 0;
    } else {
      const quantityNum = parseInt(quantity) || 1;
      weightToUse = quantityNum * materialData.stdWeight;
    }

    const totalEmissions = weightToUse * factor;

    let equivalent = '';
    if (totalEmissions < 1) {
      equivalent = `${Math.round(totalEmissions * 1000)}g = ${Math.round(totalEmissions * 100)} smartphone charges`;
    } else if (totalEmissions < 10) {
      equivalent = `${totalEmissions.toFixed(2)} kg = ${Math.round(totalEmissions * 10)} hours of LED lighting`;
    } else if (totalEmissions < 100) {
      equivalent = `${totalEmissions.toFixed(1)} kg = ${Math.round(totalEmissions * 2)} km driven`;
    } else {
      equivalent = `${(totalEmissions / 100).toFixed(1)} kg = ${Math.round(totalEmissions / 50)} trees needed to absorb`;
    }

    setResult({ emissions: totalEmissions, weightUsed: weightToUse, equivalent });
    setIsSaved(false);
  };

  const saveFootprint = () => {
    if (result && result.emissions > 0) {
      addFootprint(selectedMaterial, result.weightUsed, 1, result.emissions);
      setIsSaved(true);
      Alert.alert('Saved!', 'Your carbon footprint has been added to your dashboard.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plastic': return '#3B82F6';
      case 'metal': return '#6B7280';
      case 'paper': return '#92400E';
      case 'glass': return '#14B8A6';
      case 'organic': return '#10B981';
      case 'ewaste': return '#8B5CF6';
      default: return '#10B981';
    }
  };

  const selectedData = EMISSION_FACTORS[selectedMaterial as keyof typeof EMISSION_FACTORS];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color="#059669" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-slate-900 text-center font-poppins">Carbon Footprint</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >

        {/* Hero Banner */}
        <View className="bg-emerald-600 rounded-[28px] p-6 mb-6 shadow-lg shadow-emerald-200">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="analytics" size={26} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-xl font-poppins">Calculate Emissions</Text>
              <Text className="text-emerald-100 text-xs font-poppins mt-0.5">See your carbon footprint per material</Text>
            </View>
          </View>
          <View className="h-px bg-white/20 my-4" />
          <Text className="text-emerald-100 text-xs font-poppins leading-5">
            Enter weight in KG for precision, or use item count for a quick estimate.
          </Text>
        </View>

        {/* Material Selector */}
        <View className="mb-5">
          <Text className="text-sm font-bold text-slate-700 mb-3 font-poppins uppercase tracking-widest">Select Material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {MATERIALS.map((material) => (
                <TouchableOpacity
                  key={material}
                  className="px-3.5 py-2 rounded-full border"
                  style={
                    selectedMaterial === material
                      ? { backgroundColor: '#059669', borderColor: '#059669' }
                      : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                  }
                  onPress={() => setSelectedMaterial(material)}
                >
                  <Text
                    className="text-xs font-semibold font-poppins"
                    style={{ color: selectedMaterial === material ? 'white' : '#64748B' }}
                  >
                    {material}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View className="flex-row items-center mt-3 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
            <Ionicons name="leaf-outline" size={14} color="#059669" />
            <Text className="text-xs text-emerald-700 font-poppins ml-2">
              Emission factor: <Text className="font-bold">{selectedData.factor} kg CO₂ / kg</Text>
            </Text>
          </View>
        </View>

        {/* Input Mode Toggle */}
        <View className="flex-row bg-slate-100 rounded-2xl p-1.5 mb-5">
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl items-center"
            style={inputMode === 'weight' ? { backgroundColor: '#059669' } : {}}
            onPress={() => setInputMode('weight')}
          >
            <Text
              className="text-xs font-bold font-poppins"
              style={{ color: inputMode === 'weight' ? 'white' : '#94A3B8' }}
            >
              By Weight (KG)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl items-center"
            style={inputMode === 'count' ? { backgroundColor: '#059669' } : {}}
            onPress={() => setInputMode('count')}
          >
            <Text
              className="text-xs font-bold font-poppins"
              style={{ color: inputMode === 'count' ? 'white' : '#94A3B8' }}
            >
              By Item Count
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View className="mb-5">
          {inputMode === 'weight' ? (
            <View>
              <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest font-poppins">Total Weight (kg)</Text>
              <TextInput
                className="bg-white rounded-2xl px-4 py-4 text-base border border-slate-200 text-slate-900 font-poppins"
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
              <Text className="text-[11px] text-slate-400 mt-2 font-poppins">
                Tip: 1 kg of plastic bottles ≈ 40–50 bottles
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest font-poppins">Number of Items</Text>
              <TextInput
                className="bg-white rounded-2xl px-4 py-4 text-base border border-slate-200 text-slate-900 font-poppins"
                placeholder="1"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
              <Text className="text-[11px] text-slate-400 mt-2 font-poppins">
                Estimating ~{Math.round(selectedData.stdWeight * 1000)}g per item
              </Text>
            </View>
          )}
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          className="bg-emerald-600 rounded-2xl py-5 items-center mb-4 shadow-lg shadow-emerald-200"
          onPress={calculateFootprint}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center">
            <Ionicons name="calculator-outline" size={20} color="white" />
            <Text className="text-base font-bold text-white ml-2 font-poppins">Calculate Footprint</Text>
          </View>
        </TouchableOpacity>

        {/* Save Button */}
        {result && result.emissions > 0 && (
          <TouchableOpacity
            className="rounded-2xl py-5 items-center mb-5 border-2"
            style={
              isSaved
                ? { backgroundColor: '#F0FDF4', borderColor: '#10B981' }
                : { backgroundColor: '#10B981', borderColor: '#10B981' }
            }
            onPress={saveFootprint}
            disabled={isSaved}
            activeOpacity={0.9}
          >
            <Text
              className="text-base font-bold font-poppins"
              style={{ color: isSaved ? '#065F46' : 'white' }}
            >
              {isSaved ? '✓ Saved to Dashboard' : 'Save Result to Dashboard'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Result Card */}
        {result && result.emissions > 0 && (
          <View className="bg-white rounded-[28px] p-6 items-center shadow-sm border border-slate-100">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-poppins">
              Estimated Footprint
            </Text>

            {/* Big Number */}
            <View className="bg-emerald-50 rounded-[20px] w-full items-center py-6 mb-5 border border-emerald-100">
              <Text className="text-[48px] font-black text-emerald-600" style={{ lineHeight: 56 }}>
                {result.emissions.toFixed(3)}
              </Text>
              <Text className="text-sm font-bold text-emerald-700 font-poppins">kg CO₂ total</Text>
            </View>

            {/* Breakdown */}
            <View className="w-full bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
              <View className="flex-row justify-between mb-3">
                <Text className="text-xs text-slate-500 font-poppins">Total Mass</Text>
                <Text className="text-xs font-bold text-slate-800 font-poppins">{result.weightUsed.toFixed(3)} kg</Text>
              </View>
              <View className="h-px bg-slate-200 mb-3" />
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500 font-poppins">Emission Rate</Text>
                <Text className="text-xs font-bold text-slate-800 font-poppins">{selectedData.factor} kg CO₂ / kg</Text>
              </View>
            </View>

            {/* Equivalent Tip */}
            <View className="flex-row items-center bg-emerald-50 rounded-2xl p-4 w-full border border-emerald-100">
              <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center mr-3">
                <Ionicons name="bulb-outline" size={16} color="#059669" />
              </View>
              <Text className="flex-1 text-[11px] text-emerald-800 font-poppins leading-5">
                {result.equivalent}
              </Text>
            </View>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
