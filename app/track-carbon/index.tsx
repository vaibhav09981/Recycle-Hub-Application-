import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useJournal } from '@/context/JournalContext';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function TrackCarbonScreen() {
  const router = useRouter();
  const { scannedItems, getTotalCarbonSaved } = useJournal();
  const { user, session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);

    try {
      const userName = user?.name || session?.user?.email?.split('@')[0] || 'Eco Hero';
      const totalScanned = scannedItems.length;
      const totalRecycled = scannedItems.filter(item => item.recyclability === 'fully' || item.recyclability === 'partially').length;
      const totalCo2 = getTotalCarbonSaved().toFixed(2);
      const totalWater = scannedItems.reduce((sum, item) => sum + parseFloat(item.waterSaved || '0'), 0).toFixed(2);
      const totalEnergy = scannedItems.reduce((sum, item) => sum + parseFloat(item.energySaved || '0'), 0).toFixed(2);
      const greenPoints = Math.round(getTotalCarbonSaved() * 10);
      
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #0F172A; }
              h1 { color: #059669; font-size: 32px; border-bottom: 2px solid #059669; padding-bottom: 10px; }
              h2 { color: #14B8A6; font-size: 24px; margin-top: 30px; }
              .header { text-align: center; margin-bottom: 40px; }
              .logo { font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 2px; }
              .stats-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px; }
              .stat-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; flex: 1; min-width: 200px; }
              .stat-value { font-size: 28px; font-weight: bold; color: #059669; margin-top: 10px; }
              .stat-label { font-size: 14px; text-transform: uppercase; color: #64748B; letter-spacing: 1px; font-weight: bold; }
              .footer { margin-top: 60px; text-align: center; color: #94A3B8; font-size: 12px; border-top: 1px solid #E2E8F0; padding-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { text-align: left; padding: 12px; border-bottom: 1px solid #E2E8F0; }
              th { background-color: #F8FAFC; color: #64748B; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">RECYCLEHUB ♻️</div>
              <h1>Official Sustainability Report</h1>
              <p>Prepared for: <strong>${userName}</strong></p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h2>Executive Summary</h2>
            <p>This report highlights the positive environmental impact generated through your active participation in circular economy practices.</p>
            
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Total CO₂ Offset</div>
                <div class="stat-value">${totalCo2} kg</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Items Recycled</div>
                <div class="stat-value">${totalRecycled} / ${totalScanned}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Green Points</div>
                <div class="stat-value">${greenPoints} GP</div>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Water Conserved</div>
                <div class="stat-value" style="color:#0284C7">${totalWater} L</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Energy Saved</div>
                <div class="stat-value" style="color:#D97706">${totalEnergy} kWh</div>
              </div>
            </div>

            <h2>Recent Activity Logs</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>CO₂ Saved</th>
              </tr>
              ${scannedItems.slice(0, 10).map(item => `
                <tr>
                  <td>${new Date(item.scannedAt).toLocaleDateString()}</td>
                  <td>${item.productName}</td>
                  <td style="color:#059669; font-weight:bold;">${item.carbonSaved} kg</td>
                </tr>
              `).join('')}
            </table>
            
            <div class="footer">
              <p>Generated securely by RecycleHub AI Sustainability Engine</p>
              <p>Together, we are making the world a cleaner place.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Sustainability Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFCFB]" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-full bg-white shadow-sm items-center justify-center border border-slate-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-poppins-semibold text-slate-900">Track Impact</Text>
        <View className="w-12" />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Floating Decorative Element */}
        <View 
          className="absolute -top-10 -right-10 w-40 h-40 bg-teal/5 rounded-full" 
          style={{ transform: [{ scale: 1.5 }] }} 
        />

        {/* Hero Section */}
        <View className="mt-4 mb-8">
          <Text className="text-5xl font-poppins-bold text-slate-900 leading-tight">
            Your <Text className="font-poppins-black text-emerald-600">Green</Text>{'\n'}
            <Text className="text-teal font-poppins-black">Footprint</Text>
          </Text>
          <Text className="text-lg font-poppins text-slate-500 mt-2 leading-6">
            Calculate your <Text className="font-poppins-bold text-slate-700">emissions</Text> and celebrate your <Text className="font-poppins-bold text-slate-700">savings</Text> for a cleaner world.
          </Text>
        </View>

        {/* Action Blocks - EXTREME CURVY VERSION */}
        <View className="gap-8 mb-10">
          
          {/* Track My Carbon Footprint (GREEN) */}
          <View>
            {/* Soft background shape for depth */}
            <View 
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: -4,
                bottom: -4,
                backgroundColor: 'rgba(16, 185, 129, 0.10)',
                borderTopLeftRadius: 100,
                borderBottomRightRadius: 100,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 20,
              }}
            />
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => (router as any).push('/track-carbon/footprint')}
              style={{
                backgroundColor: '#059669',
                padding: 32,
                borderTopLeftRadius: 100,
                borderBottomRightRadius: 100,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 20,
                elevation: 10,
                shadowColor: '#059669',
                shadowOpacity: 0.35,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View className="flex-row justify-between items-center bg-white/10 p-4 rounded-3xl">
                <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center shadow-lg">
                  <Ionicons name="analytics" size={30} color="#059669" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-white font-poppins-bold text-xl">Footprint</Text>
                  <Text className="text-white/70 font-poppins text-xs">Analyze emissions</Text>
                </View>
                <Ionicons name="chevron-forward-circle" size={32} color="white" />
              </View>
              
              <View className="mt-6 flex-row items-center">
                <View className="h-1 flex-1 bg-white/20 rounded-full" />
                <Text className="text-white/60 mx-3 font-poppins-semibold text-[10px] tracking-widest uppercase">
                  MEASURE NOW
                </Text>
                <View className="h-1 flex-1 bg-white/20 rounded-full" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Track Carbon Savings (TEAL) */}
          <View>
             {/* Soft background shape for depth */}
             <View 
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                left: -4,
                bottom: -4,
                backgroundColor: 'rgba(20, 184, 166, 0.08)',
                borderTopRightRadius: 100,
                borderBottomLeftRadius: 100,
                borderTopLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}
            />
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => (router as any).push('/track-carbon/savings')}
              className="bg-teal p-8 shadow-2xl"
              style={{
                borderTopRightRadius: 100,
                borderBottomLeftRadius: 100,
                borderTopLeftRadius: 20,
                borderBottomRightRadius: 20,
                elevation: 10,
              }}
            >
              <View className="flex-row justify-between items-center bg-white/10 p-4 rounded-3xl">
                <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center shadow-lg">
                  <Ionicons name="leaf" size={30} color="#14B8A6" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-white font-poppins-bold text-xl">Savings</Text>
                  <Text className="text-white/70 font-poppins text-xs">CO₂ saved today</Text>
                </View>
                <Ionicons name="chevron-forward-circle" size={32} color="white" />
              </View>

              <View className="mt-6 flex-row items-center">
                <View className="h-1 flex-1 bg-white/20 rounded-full" />
                <Text className="text-white/60 mx-3 font-poppins-semibold text-[10px] tracking-widest uppercase">
                  TRACK IMPACT
                </Text>
                <View className="h-1 flex-1 bg-white/20 rounded-full" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Why it matters section */}
        <View className="mt-4">
          <Text className="text-xl font-poppins-bold text-slate-900 mb-6">Why it matters</Text>
          <View className="gap-5">
            {[
              { title: 'Know Your Impact', desc: 'Precision stats for every scan.', icon: 'stats-chart', color: '#6366f1' },
              { title: 'Track Progress', desc: 'Watch your recovery graph grow.', icon: 'trending-up', color: '#14b8a6' },
              { title: 'Earn Rewards', desc: 'Convert savings into credits.', icon: 'trophy', color: '#f59e0b' }
            ].map((item, index) => (
              <View key={index} className="flex-row items-center bg-white rounded-[30px] p-5 shadow-sm border border-slate-50">
                <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${item.color}10` }}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-poppins-semibold text-slate-800">{item.title}</Text>
                  <Text className="text-xs font-poppins text-slate-500">{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* View sustainability report button */}
        <TouchableOpacity 
          className="mt-12 bg-slate-900 py-5 rounded-[30px] items-center flex-row justify-center shadow-lg"
          style={{ borderTopLeftRadius: 10, borderBottomRightRadius: 10 }}
          onPress={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="white" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="document-text" size={20} color="white" style={{ marginRight: 8 }} />
          )}
          <Text className="text-white font-poppins-bold text-lg tracking-wide uppercase">
            {isGenerating ? 'Generating...' : 'Full Sustainability Report'}
          </Text>
        </TouchableOpacity>

        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
