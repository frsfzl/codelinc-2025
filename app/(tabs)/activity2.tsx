import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';

export default function Activity2Screen() {
  const { coins } = useLocalSearchParams();
  const userCoins = parseInt(coins as string) || 0;
  const [displayCoins, setDisplayCoins] = useState(userCoins);

  useEffect(() => {
    setDisplayCoins(userCoins);
  }, [userCoins]);

  useFocusEffect(
    React.useCallback(() => {
      setDisplayCoins(userCoins);
    }, [userCoins])
  );

  const handleOptionPress = (cost: number) => {
    const newCoins = userCoins - cost;
    
    if (newCoins < 0) {
      router.push('/(tabs)/activity-failed');
      return;
    }
    
    if (cost === 0) {
      // Instantly move to next activity for 0 cost
      router.push(`/(tabs)/activity3?coins=${newCoins}`);
      return;
    }
    
    // Animate coin count down
    const steps = 20;
    const stepValue = cost / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newValue = userCoins - (stepValue * currentStep);
      setDisplayCoins(Math.max(0, Math.round(newValue)));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          router.push(`/(tabs)/activity3?coins=${newCoins}`);
        }, 500);
      }
    }, 50);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            Alert.alert(
              'Leave Activity?',
              'You will lose all your progress if you leave. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Leave', 
                  style: 'destructive',
                  onPress: () => {
                    router.push('/(tabs)/budgeting-basics?reset=true');
                    setTimeout(() => {
                      router.push('/(tabs)/learning');
                    }, 100);
                  }
                }
              ]
            );
          }} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Activity</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.coinDisplay}>
            <Image source={require('@/assets/images/penny.png')} style={styles.largePenny} />
            <ThemedText style={styles.coinAmount}>{displayCoins}</ThemedText>
          </View>

          <ThemedText style={styles.question}>
            The new Pokemon Game came out. Are you buying it?
          </ThemedText>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleOptionPress(1000)}
            >
              <ThemedText style={styles.optionText}>Catch 'em all</ThemedText>
              <View style={styles.costContainer}>
                <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                <ThemedText style={styles.costText}>1000</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleOptionPress(0)}
            >
              <ThemedText style={styles.optionText}>Run away</ThemedText>
              <View style={styles.costContainer}>
                <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                <ThemedText style={styles.costText}>0</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#0F1720' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  largePenny: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  coinAmount: {
    paddingTop: 30,
    color: '#CD7F32',
    fontSize: 48,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 32,
  },
  optionsContainer: {
    width: '100%',
    gap: 20,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F1726',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallPenny: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  costText: {
    color: '#CD7F32',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
