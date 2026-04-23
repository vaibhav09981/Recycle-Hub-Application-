import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCarbon } from '@/context/CarbonContext';
import { Ionicons } from '@expo/vector-icons';

// Recycling savings factors (kg CO2 saved per kg recycled)
const SAVINGS_FACTORS: Record<string, { savings: number; percent: number; category: string; stdWeight: number }> = {
  'PET (Plastic bottles)': { savings: 2.3, percent: 67, category: 'plastic', stdWeight: 0.025 },
  'HDPE (Milk jugs)': { savings: 1.3, percent: 68, category: 'plastic', stdWeight: 0.06 },
  'Plastic bags': { savings: 1.4, percent: 70, category: 'plastic', stdWeight: 0.005 },
  'Aluminum (cans)': { savings: 8.1, percent: 90, category: 'metal', stdWeight: 0.015 },
  'Steel (tin cans)': { savings: 1.7, percent: 74, category: 'metal', stdWeight: 0.05 },
  'Cardboard': { savings: 0.7, percent: 77, category: 'paper', stdWeight: 0.2 },
  'Mixed paper': { savings: 0.9, percent: 82, category: 'paper', stdWeight: 0.005 },
  'Glass bottles': { savings: 0.3, percent: 37, category: 'glass', stdWeight: 0.2 },
  'Electronics': { savings: 150, percent: 75, category: 'ewaste', stdWeight: 2.0 },
};

const MATERIALS = Object.keys(SAVINGS_FACTORS);

export default function SavingsScreen() {
  const router = useRouter();
  const { totalSavings: contextTotalSavings, addSavings } = useCarbon();
  const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIALS[0]);
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [inputMode, setInputMode] = useState<'weight' | 'count'>('weight');
  const [result, setResult] = useState<{ savings: number; weightUsed: number; percent: number; equivalent: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate equivalents based on real total
  const calculateEquivalents = (savings: number) => {
    const equivalentKm = Math.round(savings * 4); // 1 kg CO2 ≈ 4 km driving
    const equivalentTrees = Number((savings / 50).toFixed(2)); // 1 tree absorbs ~50 kg CO2/year
    return { km: equivalentKm, trees: equivalentTrees };
  };

  const calculateSavings = () => {
    const materialData = SAVINGS_FACTORS[selectedMaterial];
    
    let weightToUse = 0;
    if (inputMode === 'weight') {
      weightToUse = parseFloat(weight) || 0;
    } else {
      const quantityNum = parseInt(quantity) || 1;
      weightToUse = quantityNum * materialData.stdWeight;
    }
    
    const totalSavings = weightToUse * materialData.savings;
    
    // Calculate equivalent
    let equivalent = '';
    if (totalSavings < 0.5) {
      equivalent = `${Math.round(totalSavings * 1000)}g = ${Math.round(totalSavings * 100)} smartphone charges`;
    } else if (totalSavings < 5) {
      equivalent = `${totalSavings.toFixed(2)} kg = ${Math.round(totalSavings * 10)} hours of LED lighting`;
    } else if (totalSavings < 50) {
      equivalent = `${totalSavings.toFixed(1)} kg = ${Math.round(totalSavings / 2)} km not driven`;
    } else {
      equivalent = `${(totalSavings / 10).toFixed(1)} kg = ${(totalSavings / 50).toFixed(1)} trees planted`;
    }

    setResult({ savings: totalSavings, weightUsed: weightToUse, percent: materialData.percent, equivalent });
    setIsSaved(false);
  };

  const saveSavings = () => {
    if (result && result.savings > 0) {
      addSavings(selectedMaterial, result.weightUsed, 1, result.savings);
      setIsSaved(true);
      Alert.alert('Saved!', 'Your carbon savings have been added to your dashboard.');
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

  const selectedData = SAVINGS_FACTORS[selectedMaterial];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <TouchableOpacity
          className="flex-row items-center py-2"
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-xl text-primary font-semibold mr-1">←</Text>
          <Text className="text-base font-semibold text-primary">BACK</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-slate-900 mr-10 font-poppins">Carbon Savings</Text>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Total Impact Card */}
        <View className="bg-emerald-600 rounded-[32px] p-8 items-center mb-6 shadow-xl shadow-emerald-200">
           <View className="bg-white/20 px-4 py-1.5 rounded-full mb-4">
              <Text className="text-[10px] font-extrabold text-white uppercase tracking-widest">Global Impact Score</Text>
           </View>
           <Text className="text-sm text-emerald-50 mb-1 font-poppins">Total CO₂ Offset</Text>
           <View className="flex-row items-baseline mb-4">
              <Text className="text-5xl font-black text-white font-poppins">{contextTotalSavings.toFixed(1)}</Text>
              <Text className="text-xl font-bold text-emerald-100 ml-2 font-poppins">KG</Text>
           </View>
           
           <View className="flex-row w-full justify-around mt-2 pt-6 border-t border-white/10">
              <View className="items-center">
                 <View className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center mb-2">
                    <Ionicons name="car-outline" size={22} color="white" />
                 </View>
                 <Text className="text-sm font-bold text-white">{calculateEquivalents(contextTotalSavings).km} km</Text>
                 <Text className="text-[10px] text-emerald-100 font-medium font-poppins">Emissions Avoided</Text>
              </View>
              <View className="items-center">
                 <View className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center mb-2">
                    <Ionicons name="leaf-outline" size={22} color="white" />
                 </View>
                 <Text className="text-sm font-bold text-white">{calculateEquivalents(contextTotalSavings).trees}</Text>
                 <Text className="text-[10px] text-emerald-100 font-medium font-poppins">Trees Equivalent</Text>
              </View>
           </View>
        </View>

        {/* Calculator Section */}
        <View className="bg-white rounded-[28px] p-6 mb-6 border border-slate-100 shadow-sm">
          <Text className="text-lg font-bold text-slate-900 font-poppins mb-1">Savings Calculator</Text>
          <Text className="text-xs text-slate-400 mb-6 leading-5 font-poppins">
            Estimate your impact by entering the weight of materials you've diverted from landfills.
          </Text>

          {/* Material Selector */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 font-poppins">Material Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <View className="flex-row gap-2">
              {MATERIALS.map((material) => (
                <TouchableOpacity
                  key={material}
                  className={`px-4 py-2.5 rounded-2xl ${selectedMaterial === material ? '' : 'bg-slate-50 border border-slate-100'}`}
                  style={selectedMaterial === material ? { backgroundColor: getCategoryColor(SAVINGS_FACTORS[material].category) } : {}}
                  onPress={() => setSelectedMaterial(material)}
                >
                  <Text className={`text-[11px] font-bold ${selectedMaterial === material ? 'text-white' : 'text-slate-500'} font-poppins`}>
                    {material}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Input Mode Toggle */}
          <View className="flex-row bg-slate-50 rounded-2xl p-1.5 mb-6 border border-slate-100">
            <TouchableOpacity 
              className={`flex-1 py-3 rounded-xl items-center ${inputMode === 'weight' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setInputMode('weight')}
            >
              <Text className={`text-[11px] font-bold ${inputMode === 'weight' ? 'text-emerald-700' : 'text-slate-400'} font-poppins`}>By Weight (KG)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-3 rounded-xl items-center ${inputMode === 'count' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setInputMode('count')}
            >
              <Text className={`text-[11px] font-bold ${inputMode === 'count' ? 'text-emerald-700' : 'text-slate-400'} font-poppins`}>By Item Count</Text>
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          <View className="mb-6">
            {inputMode === 'weight' ? (
              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase mb-2 font-poppins">Total Weight Diverted</Text>
                <TextInput
                  className="bg-slate-50 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 border border-slate-100"
                  placeholder="0.00 kg"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            ) : (
              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase mb-2 font-poppins">Number of Items</Text>
                <TextInput
                  className="bg-slate-50 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 border border-slate-100"
                  placeholder="1"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <Text className="text-[10px] text-slate-400 mt-2 italic font-poppins">
                  Est. Weight: ~{Math.round(selectedData.stdWeight * 1000)}g per item
                </Text>
              </View>
            )}
          </View>

          {/* Calculate Button */}
          <TouchableOpacity 
            className="bg-emerald-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200" 
            onPress={calculateSavings} 
            activeOpacity={0.9}
          >
            <Text className="text-white font-bold text-base font-poppins">Calculate Impact</Text>
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        {result && result.savings > 0 && (
          <View className="bg-emerald-50 rounded-[32px] p-6 mb-8 border-2 border-emerald-100 items-center">
            <View className="w-12 h-12 rounded-full bg-white items-center justify-center mb-4 shadow-sm">
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
            </View>
            
            <Text className="text-sm font-bold text-emerald-800 font-poppins mb-1">You Saved</Text>
            <View className="flex-row items-baseline mb-4">
                <Text className="text-4xl font-black text-emerald-600 font-poppins">+{result.savings.toFixed(3)}</Text>
                <Text className="text-lg font-bold text-emerald-400 ml-1.5 font-poppins">kg CO₂</Text>
            </View>

            <View className="w-full bg-white rounded-2xl p-4 mb-4 shadow-sm border border-emerald-100">
               <View className="flex-row justify-between mb-2 items-center">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Savings Efficiency</Text>
                  <Text className="text-xs font-black text-emerald-600">{result.percent}%</Text>
               </View>
               <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.percent}%` }} />
               </View>
            </View>

            <View className="bg-emerald-600 rounded-xl p-4 w-full mb-6">
                <Text className="text-xs text-white text-center font-bold font-poppins">
                    Equivalent to: {result.equivalent}
                </Text>
            </View>

            <TouchableOpacity 
              className={`w-full py-4 rounded-xl items-center ${isSaved ? 'bg-white border border-emerald-100' : 'bg-emerald-100 border border-emerald-200'}`}
              onPress={saveSavings}
              disabled={isSaved}
            >
              <Text className={`text-sm font-bold ${isSaved ? 'text-emerald-400' : 'text-emerald-700'} font-poppins`}>
                {isSaved ? '✓ Recorded in Impact Dashboard' : 'Record Result'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
