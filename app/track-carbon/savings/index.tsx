import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCarbon } from '@/context/CarbonContext';

// Colors from UI/UX Guide
const COLORS = {
  primary: '#10B981',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  warning: '#F59E0B',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

// Recycling savings factors (kg CO2 saved per kg recycled)
const SAVINGS_FACTORS: Record<string, { savings: number; percent: number; category: string }> = {
  'PET (Plastic bottles)': { savings: 2.3, percent: 67, category: 'plastic' },
  'HDPE (Milk jugs)': { savings: 1.3, percent: 68, category: 'plastic' },
  'Plastic bags': { savings: 1.4, percent: 70, category: 'plastic' },
  'Aluminum (cans)': { savings: 8.1, percent: 90, category: 'metal' },
  'Steel (tin cans)': { savings: 1.7, percent: 74, category: 'metal' },
  'Cardboard': { savings: 0.7, percent: 77, category: 'paper' },
  'Mixed paper': { savings: 0.9, percent: 82, category: 'paper' },
  'Glass bottles': { savings: 0.3, percent: 37, category: 'glass' },
  'Electronics': { savings: 150, percent: 75, category: 'ewaste' },
};

const MATERIALS = Object.keys(SAVINGS_FACTORS);

// Mock total savings data
const MOCK_TOTAL_SAVINGS = {
  total: 18.3,
  equivalentKm: 73,
  equivalentTrees: 0.8,
};

export default function SavingsScreen() {
  const router = useRouter();
  const { totalSavings: contextTotalSavings, addSavings } = useCarbon();
  const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIALS[0]);
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [result, setResult] = useState<{ savings: number; percent: number; equivalent: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate equivalents based on real total
  const calculateEquivalents = (savings: number) => {
    const equivalentKm = Math.round(savings * 4); // 1 kg CO2 ≈ 4 km driving
    const equivalentTrees = Number((savings / 50).toFixed(2)); // 1 tree absorbs ~50 kg CO2/year
    return { km: equivalentKm, trees: equivalentTrees };
  };

  const calculateSavings = () => {
    const weightNum = parseFloat(weight) || 0;
    const quantityNum = parseInt(quantity) || 1;
    const data = SAVINGS_FACTORS[selectedMaterial];
    
    const totalSavings = weightNum * data.savings * quantityNum;
    
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

    setResult({ savings: totalSavings, percent: data.percent, equivalent });
    setIsSaved(false);
  };

  const saveSavings = () => {
    if (result && result.savings > 0) {
      const weightNum = parseFloat(weight) || 0;
      const quantityNum = parseInt(quantity) || 1;
      addSavings(selectedMaterial, weightNum, quantityNum, result.savings);
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
      default: return COLORS.primary;
    }
  };

  const selectedData = SAVINGS_FACTORS[selectedMaterial];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero Card - Total Savings */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🌱</Text>
          <Text style={styles.heroLabel}>Total CO2 Saved</Text>
          <Text style={styles.heroValue}>{contextTotalSavings.toFixed(1)} kg</Text>
          <View style={styles.equivalentRow}>
            <View style={styles.equivalentItem}>
              <Text style={styles.equivalentIcon}>🚗</Text>
              <Text style={styles.equivalentText}>{calculateEquivalents(contextTotalSavings).km} km</Text>
            </View>
            <View style={styles.equivalentItem}>
              <Text style={styles.equivalentIcon}>🌳</Text>
              <Text style={styles.equivalentText}>{calculateEquivalents(contextTotalSavings).trees} trees</Text>
            </View>
          </View>
        </View>

        {/* Calculator Section */}
        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>Calculate Your Savings</Text>
          <Text style={styles.calculatorSubtitle}>
            Enter material and weight to see how much CO2 you save by recycling
          </Text>

          {/* Material Selector */}
          <Text style={styles.inputLabel}>Select Material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {MATERIALS.map((material) => (
                <TouchableOpacity
                  key={material}
                  style={[
                    styles.chip,
                    selectedMaterial === material && { backgroundColor: getCategoryColor(SAVINGS_FACTORS[material].category) },
                  ]}
                  onPress={() => setSelectedMaterial(material)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedMaterial === material && styles.chipTextActive,
                  ]}>
                    {material}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.selectedInfo}>
            Savings: {selectedData.savings} kg CO2/kg ({selectedData.percent}% savings)
          </Text>

          {/* Input Section */}
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={calculateSavings} activeOpacity={0.9}>
            <Text style={styles.calculateButtonText}>Calculate Savings</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {result && result.savings > 0 && (
          <TouchableOpacity 
            style={[styles.saveButton, isSaved && styles.saveButtonSaved]} 
            onPress={saveSavings}
            disabled={isSaved}
            activeOpacity={0.9}
          >
            <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextSaved]}>
              {isSaved ? '✓ Saved to Dashboard' : 'Save to Dashboard'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Result Card */}
        {result && result.savings > 0 && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultEmoji}>🎉</Text>
              <Text style={styles.resultHeaderTitle}>Great Job!</Text>
            </View>
            <Text style={styles.resultValue}>+{result.savings.toFixed(3)} kg CO2</Text>
            <Text style={styles.resultPercent}>That is {result.percent}% savings!</Text>
            <View style={styles.resultEquivalent}>
              <Text style={styles.resultEquivalentText}>
                Equivalent to: {result.equivalent}
              </Text>
            </View>
            <View style={styles.encourageCard}>
              <Text style={styles.encourageText}>
                Keep recycling! Every item makes a difference for our planet. 🌍
              </Text>
            </View>
          </View>
        )}

        {/* Monthly Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Monthly Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
          <Text style={styles.progressText}>65% toward this month goal</Text>
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
  // Custom Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  // Hero Card
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  equivalentRow: {
    flexDirection: 'row',
    gap: 24,
  },
  equivalentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equivalentIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  equivalentText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Poppins',
  },
  // Calculator Card
  calculatorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  calculatorSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginBottom: 16,
    lineHeight: 18,
  },
  // Material Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedInfo: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 16,
    fontWeight: '500',
  },
  // Input Section
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Calculate Button
  calculateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  // Result Card
  resultCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  resultHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryDark,
    fontFamily: 'Poppins',
  },
  resultValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  resultPercent: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  resultEquivalent: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 12,
  },
  resultEquivalentText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  encourageCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  encourageText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  // Monthly Progress
  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  // Save Button
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonSaved: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  saveButtonTextSaved: {
    color: COLORS.primaryDark,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
