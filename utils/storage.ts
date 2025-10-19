import AsyncStorage from '@react-native-async-storage/async-storage';

const BALANCE_KEY = 'user_balance';
const PORTFOLIO_KEY = 'user_portfolio';

export const getBalance = async (): Promise<number> => {
  try {
    const balance = await AsyncStorage.getItem(BALANCE_KEY);
    return balance ? parseInt(balance) : 0;
  } catch (error) {
    return 0;
  }
};

export const setBalance = async (balance: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(BALANCE_KEY, balance.toString());
  } catch (error) {
    console.error('Error saving balance:', error);
  }
};

export const getPortfolio = async (): Promise<any[]> => {
  try {
    const portfolio = await AsyncStorage.getItem(PORTFOLIO_KEY);
    return portfolio ? JSON.parse(portfolio) : [];
  } catch (error) {
    return [];
  }
};

export const setPortfolio = async (portfolio: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  } catch (error) {
    console.error('Error saving portfolio:', error);
  }
};

export const resetBalance = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(BALANCE_KEY, '0');
  } catch (error) {
    console.error('Error resetting balance:', error);
  }
};