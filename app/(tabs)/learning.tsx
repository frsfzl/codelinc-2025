import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getBalance, setBalance } from '@/utils/storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const modules = [
  {
    id: 1,
    title: 'Budgeting Basics',
    description: 'Learn how to create and manage your budget effectively',
    icon: 'chart.bar.fill',
    color: '#4CAF50',
  },
  {
    id: 2,
    title: 'Emergency Savings',
    description: 'Build your financial safety net with smart saving strategies',
    icon: 'shield.fill',
    color: '#FF9800',
  },
  {
    id: 3,
    title: 'Debt Management',
    description: 'Master strategies to pay off debt and stay debt-free',
    icon: 'creditcard.fill',
    color: '#2196F3',
  },
];

export default function LearningScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  const [balance, setBalanceState] = React.useState(0);
  const [showModules, setShowModules] = React.useState(false);
  const params = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      const loadBalance = async () => {
        const savedBalance = await getBalance();
        setBalanceState(savedBalance);
      };
      loadBalance();
      
      if (params.finalCoins !== undefined && params.finalCoins !== '') {
        const finalCoins = parseInt(params.finalCoins as string, 10);
        if (!isNaN(finalCoins)) {
          const updateBalance = async () => {
            await setBalance(finalCoins);
            setBalanceState(finalCoins);
          };
          updateBalance();
        }
        router.setParams({ finalCoins: '' });
      }
    }, [params])
  );

  const handleModulePress = (moduleTitle: string) => {
    if (moduleTitle === 'Budgeting Basics') {
      router.push({ pathname: '/(tabs)/budgeting-basics', params: { reset: 'true' } });
    } else if (moduleTitle === 'Emergency Savings' || moduleTitle === 'Debt Management') {
      Alert.alert('Coming Soon', `${moduleTitle} module is coming soon!`);
    } else {
      Alert.alert('Module Selected', `You selected: ${moduleTitle}`);
    }
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>{"\n"}Financial Learning</ThemedText>
        <ThemedText style={styles.subtitle}>Master your money with these modules</ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceSection}>
          <ThemedText style={styles.balanceTitle}>Balance</ThemedText>
          <View style={styles.balanceRow}>
            <Image source={require('@/assets/images/penny.png')} style={styles.balancePenny} />
            <ThemedText style={styles.balanceAmount}>{balance}</ThemedText>
          </View>
        </View>

        <View style={[styles.dropdownContainer, { borderColor: colors.tint }]}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setShowModules(!showModules)}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownContent}>
              <ThemedText style={styles.dropdownTitle}>Learning Modules</ThemedText>
              <ThemedText style={styles.dropdownSubtitle}>Earn money by completing modules</ThemedText>
            </View>
            <IconSymbol 
              name={showModules ? "chevron.down" : "chevron.right"} 
              size={20} 
              color={colors.icon} 
            />
          </TouchableOpacity>
          
          {showModules && (
            <>
              {modules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={[styles.moduleCard, { borderColor: colors.tint }]}
            onPress={() => handleModulePress(module.title)}
            activeOpacity={0.8}
          >
            <ThemedView style={[styles.iconContainer, { backgroundColor: module.color }]}>
              <IconSymbol name={module.icon} size={20} color="white" />
            </ThemedView>
            
            <ThemedView style={styles.moduleContent}>
              <ThemedText style={styles.moduleTitle}>{module.title}</ThemedText>
              <ThemedText style={styles.moduleDescription}>{module.description}</ThemedText>
            </ThemedView>
            
            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
              </TouchableOpacity>
              ))}
            </>
          )}
        </View>
        
        <View style={[styles.investmentSection, { borderColor: colors.tint }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.tint} />
            <View style={styles.sectionHeaderText}>
              <ThemedText style={styles.sectionTitle}>Long-Term Investing</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Build wealth through compound growth</ThemedText>
            </View>
          </View>
          
          <ThemedText style={styles.investmentDescription}>
            Time is your greatest asset in investing. Even small amounts can grow significantly over decades through compound interest.
          </ThemedText>
          
          <TouchableOpacity
            style={[styles.simulatorButton, { backgroundColor: '#98012E', borderColor: '#231F20' }]}
            onPress={() => router.push('/(tabs)/investing')}
            activeOpacity={0.8}
          >
            <IconSymbol name="calculator" size={20} color="white" />
            <ThemedText style={styles.simulatorButtonText}>💰 Try Investment Simulator</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  balanceSection: {
    alignItems: 'flex-start',
    paddingVertical: 20,
    marginBottom: 20,
  },

  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balancePenny: {
    width: 60,
    height: 60,
    marginRight: 20,
  },
  balanceAmount: {
    paddingTop: 65,
    fontSize: 76,
    fontWeight: 'bold',
    color: '#CD7F32',
  },
  dropdownContainer: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContent: {
    flex: 1,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  dropdownSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  investmentSection: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  investmentDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 16,
  },
  simulatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
  },
  simulatorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

});
