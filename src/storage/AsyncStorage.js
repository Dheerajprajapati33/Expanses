import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = '@expense_tracker_transactions';
const USER_KEY = '@expense_tracker_user';
const USERS_LIST_KEY = '@expense_tracker_users_list';
const NOTIFICATIONS_KEY = '@expense_tracker_notifications';

export const storage = {
  getTransactions: async () => {
    try {
      const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load transactions from storage', e);
      return [];
    }
  },

  saveTransactions: async (transactions) => {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      return true;
    } catch (e) {
      console.error('Failed to save transactions to storage', e);
      return false;
    }
  },

  getUser: async () => {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load user from storage', e);
      return null;
    }
  },

  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return true;
    } catch (e) {
      console.error('Failed to save user to storage', e);
      return false;
    }
  },

  getUsers: async () => {
    try {
      const data = await AsyncStorage.getItem(USERS_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load users list from storage', e);
      return [];
    }
  },

  saveUsers: async (users) => {
    try {
      await AsyncStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Failed to save users list to storage', e);
      return false;
    }
  },

  getNotifications: async () => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load notifications from storage', e);
      return [];
    }
  },

  saveNotifications: async (notifications) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      return true;
    } catch (e) {
      console.error('Failed to save notifications to storage', e);
      return false;
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.removeItem(TRANSACTIONS_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(USERS_LIST_KEY);
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear storage', e);
      return false;
    }
  }
};
