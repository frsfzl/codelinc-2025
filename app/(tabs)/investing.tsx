import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getBalance, getPortfolio, setBalance } from '@/utils/storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const FINNHUB_API_KEY = 'd3q7kl1r01qgab53hge0d3q7kl1r01qgab53hgeg';
const POPULAR_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Portfolio {
  symbol: string;
  shares: number;
  avgPrice: number;
}

export default function InvestingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  
  const [balance, setBalanceState] = useState(0);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'browse'>('portfolio');

  useEffect(() => {
    loadInitialData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      updatePortfolioStocks();
      loadInitialData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchSymbol.trim()) {
        searchStock();
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchSymbol]);

  const updatePortfolioStocks = async () => {
    if (portfolio.length === 0) return;
    
    const portfolioSymbols = portfolio.map(p => p.symbol);
    const updatedStocks = await fetchStockData(portfolioSymbols);
    
    // Update existing stocks array with portfolio stock prices
    setStocks(prevStocks => {
      const updatedStocksMap = new Map(updatedStocks.map(s => [s.symbol, s]));
      return prevStocks.map(stock => updatedStocksMap.get(stock.symbol) || stock);
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        const savedBalance = await getBalance();
        const savedPortfolio = await getPortfolio();
        setBalanceState(savedBalance);
        setPortfolio(savedPortfolio);
        
        // Fetch current prices for portfolio stocks
        if (savedPortfolio.length > 0) {
          const portfolioSymbols = savedPortfolio.map(p => p.symbol);
          const allSymbols = [...new Set([...POPULAR_STOCKS, ...portfolioSymbols])];
          const stockData = await fetchStockData(allSymbols);
          setStocks(stockData);
        }
      };
      loadData();
    }, [])
  );

  const fetchStockData = async (symbols: string[] = POPULAR_STOCKS) => {
    try {
      const stockPromises = symbols.map(async (symbol) => {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        const data = await response.json();
        return {
          symbol,
          price: data.c || 0,
          change: data.d || 0,
          changePercent: data.dp || 0,
        };
      });
      
      const stockData = await Promise.all(stockPromises);
      return stockData;
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch stock data');
      return [];
    }
  };

  const searchStock = async () => {
    if (!searchSymbol.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    const results = await fetchStockData([searchSymbol.toUpperCase()]);
    setSearchResults(results);
    setLoading(false);
  };

  const loadInitialData = async () => {
    setLoading(true);
    const stockData = await fetchStockData();
    setStocks(stockData);
    setLoading(false);
  };

  const buyStock = (stock: Stock, shares: number) => {
    const totalCost = Math.round(stock.price * shares);
    
    if (totalCost > balance) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough pennies to buy this stock.');
      return;
    }

    const newBalance = balance - totalCost;
    setBalanceState(newBalance);
    setBalance(newBalance);
    
    // Add stock to main stocks array if not already there
    setStocks(prev => {
      const exists = prev.find(s => s.symbol === stock.symbol);
      if (!exists) {
        return [...prev, stock];
      }
      return prev;
    });
    
    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol === stock.symbol);
      let newPortfolio;
      if (existing) {
        const totalShares = existing.shares + shares;
        const totalValue = (existing.avgPrice * existing.shares) + (stock.price * shares);
        newPortfolio = prev.map(p => 
          p.symbol === stock.symbol 
            ? { ...p, shares: totalShares, avgPrice: totalValue / totalShares }
            : p
        );
      } else {
        newPortfolio = [...prev, { symbol: stock.symbol, shares, avgPrice: stock.price }];
      }
      setPortfolio(newPortfolio);
      return newPortfolio;
    });

    Alert.alert('Success', `Bought ${shares} shares of ${stock.symbol} for ${totalCost} pennies`);
  };

  const sellStock = (portfolioItem: Portfolio) => {
    const currentStock = stocks.find(s => s.symbol === portfolioItem.symbol);
    if (!currentStock) return;

    const totalValue = Math.round(currentStock.price * portfolioItem.shares);
    const newBalance = balance + totalValue;
    setBalanceState(newBalance);
    setBalance(newBalance);
    
    const newPortfolio = portfolio.filter(p => p.symbol !== portfolioItem.symbol);
    setPortfolio(newPortfolio);
    setPortfolio(newPortfolio);
    
    Alert.alert('Success', `Sold ${portfolioItem.shares} shares of ${portfolioItem.symbol} for ${totalValue} pennies`);
  };

  const promptBuyStock = (stock: Stock) => {
    Alert.prompt(
      'Buy Stock',
      `How many shares of ${stock.symbol} would you like to buy?\nPrice: ${stock.price.toFixed(2)} pennies per share`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: (text) => {
            const shares = parseInt(text || '0');
            if (shares > 0) buyStock(stock, shares);
          }
        }
      ],
      'plain-text',
      '1'
    );
  };

  const getPortfolioValue = () => {
    return portfolio.reduce((total, item) => {
      const currentStock = stocks.find(s => s.symbol === item.symbol);
      return total + (currentStock ? currentStock.price * item.shares : 0);
    }, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading market data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.icon} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Paper Trading</ThemedText>
      </ThemedView>

      <View style={styles.balanceSection}>
        <View style={styles.balanceRow}>
          <Image source={require('@/assets/images/penny.png')} style={styles.pennyIcon} />
          <ThemedText style={styles.balanceAmount}>{balance}</ThemedText>
        </View>
        <ThemedText style={styles.portfolioValue}>
          Portfolio Value: {Math.round(getPortfolioValue())}
        </ThemedText>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'portfolio' && { backgroundColor: colors.tint }]}
          onPress={() => setActiveTab('portfolio')}
        >
          <ThemedText style={[styles.tabText, { color: activeTab === 'portfolio' ? 'black' : 'white' }]}>
            Portfolio
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && { backgroundColor: colors.tint }]}
          onPress={() => setActiveTab('browse')}
        >
          <ThemedText style={[styles.tabText, { color: activeTab === 'browse' ? 'black' : 'white' }]}>
            Browse
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'browse' && (
        <View style={[styles.searchContainer, { borderColor: colors.tint }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search stocks (e.g., AAPL, TSLA)"
            placeholderTextColor={colors.icon}
            value={searchSymbol}
            onChangeText={setSearchSymbol}
            autoCapitalize="characters"
          />
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'portfolio' ? (
          portfolio.length > 0 ? (
            portfolio.map((item) => {
              const currentStock = stocks.find(s => s.symbol === item.symbol);
              const currentValue = currentStock ? currentStock.price * item.shares : 0;
              const profit = currentValue - (item.avgPrice * item.shares);
              
              return (
                <TouchableOpacity
                  key={item.symbol}
                  style={[styles.stockCard, { borderColor: colors.tint }]}
                  onPress={() => sellStock(item)}
                >
                  <View style={styles.stockHeader}>
                    <ThemedText style={styles.stockSymbol}>{item.symbol}</ThemedText>
                    <View style={styles.priceContainer}>
                      <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                      <ThemedText style={styles.stockPrice}>
                        {currentStock?.price.toFixed(2) || '0.00'}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.stockDetails}>
                    <ThemedText style={styles.stockShares}>{item.shares} shares</ThemedText>
                    <ThemedText style={[styles.stockProfit, { color: profit >= 0 ? '#4CAF50' : '#F44336' }]}>
                      {profit >= 0 ? '+' : ''}{Math.round(profit)}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={48} color={colors.icon} />
              <ThemedText style={styles.emptyTitle}>No Investments Yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>Start building your portfolio by browsing stocks</ThemedText>
            </View>
          )
        ) : (
          <>
            {searchResults.length > 0 && (
              <View style={styles.searchResultsSection}>
                <ThemedText style={styles.sectionTitle}>Search Results</ThemedText>
                {searchResults.map((stock) => (
                  <TouchableOpacity
                    key={stock.symbol}
                    style={[styles.stockCard, { borderColor: colors.tint }]}
                    onPress={() => promptBuyStock(stock)}
                  >
                    <View style={styles.stockHeader}>
                      <ThemedText style={styles.stockSymbol}>{stock.symbol}</ThemedText>
                      <View style={styles.priceContainer}>
                        <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                        <ThemedText style={styles.stockPrice}>{stock.price.toFixed(2)}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.stockDetails}>
                      <ThemedText style={[styles.changeText, { color: stock.change >= 0 ? '#4CAF50' : '#F44336' }]}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={styles.popularSection}>
              <ThemedText style={styles.sectionTitle}>Popular Stocks</ThemedText>
              {stocks.map((stock) => (
                <TouchableOpacity
                  key={stock.symbol}
                  style={[styles.stockCard, { borderColor: colors.tint }]}
                  onPress={() => promptBuyStock(stock)}
                >
                  <View style={styles.stockHeader}>
                    <ThemedText style={styles.stockSymbol}>{stock.symbol}</ThemedText>
                    <View style={styles.priceContainer}>
                      <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                      <ThemedText style={styles.stockPrice}>{stock.price.toFixed(2)}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.stockDetails}>
                    <ThemedText style={[styles.changeText, { color: stock.change >= 0 ? '#4CAF50' : '#F44336' }]}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  balanceSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  pennyIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  balanceAmount: {
    paddingTop: 12,
    fontSize: 31,
    fontWeight: 'bold',
    color: '#CD7F32',
  },
  portfolioValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stockCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockShares: {
    fontSize: 14,
    opacity: 0.7,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallPenny: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  stockProfit: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  searchResultsSection: {
    marginBottom: 20,
  },
  popularSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});