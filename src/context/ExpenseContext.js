import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { storage } from '../storage/AsyncStorage';

import { Platform } from 'react-native';

const ExpenseContext = createContext();

// Dynamic API URL for localhost/emulator resolution based on active platform
const API_URL = Platform.select({
  android: 'http://10.0.2.2:3000', // standard emulator localhost route
  default: 'https://expense-tracker-api-eb1a.onrender.com'
});
const AXIOS_TIMEOUT = 3000;

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Setup Axios instance with short timeout so it doesn't hang if server is offline
  const api = axios.create({
    baseURL: API_URL,
    timeout: AXIOS_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Filter transactions for the logged-in user (default fallback to 'dheeraj@example.com' for dummy data)
  const transactions = allTransactions.filter(tx => {
    const txEmail = tx.userEmail || 'dheeraj@example.com';
    return txEmail === user?.email;
  });

  // Load user, users list, and transactions on startup
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // 1. Load from AsyncStorage first
        const localUser = await storage.getUser();
        const localTransactions = await storage.getTransactions();
        const localUsersList = await storage.getUsers();
        const localNotifications = await storage.getNotifications();
        
        if (localUser) {
          if (localUser.geminiApiKey === 'spent') {
            localUser.geminiApiKey = '';
            await storage.saveUser(localUser);
          }
          setUser(localUser);
        }
        
        if (localTransactions && localTransactions.length > 0) {
          setAllTransactions(localTransactions);
        }

        if (localNotifications && localNotifications.length > 0) {
          setNotifications(localNotifications);
        }

        const defaultDemoUser = {
          id: '1',
          name: 'Dheeraj Prajapati',
          email: 'dheeraj@example.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          currency: 'INR',
          budget: 50000,
          geminiApiKey: '',
        };

        if (localUsersList && localUsersList.length > 0) {
          let updatedList = false;
          const updatedUsers = localUsersList.map(u => {
            if (u.geminiApiKey === 'spent') {
              u.geminiApiKey = '';
              updatedList = true;
            }
            return u;
          });
          if (updatedList) {
            await storage.saveUsers(updatedUsers);
            setUsersList(updatedUsers);
          } else {
            setUsersList(localUsersList);
          }
        } else {
          setUsersList([defaultDemoUser]);
          await storage.saveUsers([defaultDemoUser]);
        }



        // 2. Try to sync with server
        await syncWithServer(
          localTransactions, 
          localUsersList && localUsersList.length > 0 ? localUsersList : [defaultDemoUser],
          localNotifications
        );
      } catch (err) {
        console.log('Error initializing data', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state with JSON Server
  const syncWithServer = async (currentLocalData, currentLocalUsers, currentLocalNotifications) => {
    setIsSyncing(true);
    const fallbackNotifications = currentLocalNotifications || notifications;
    try {
      // 1. Sync transactions
      const response = await api.get('/transactions');
      if (response.data && Array.isArray(response.data)) {
        const serverTransactions = response.data;
        setAllTransactions(serverTransactions);
        await storage.saveTransactions(serverTransactions);
      }

      // 2. Sync users
      const usersResponse = await api.get('/users');
      if (usersResponse.data && Array.isArray(usersResponse.data)) {
        const serverUsers = usersResponse.data;
        setUsersList(serverUsers);
        await storage.saveUsers(serverUsers);
      }

      // 3. Sync notifications
      try {
        const notifResponse = await api.get('/notifications');
        if (notifResponse.data && Array.isArray(notifResponse.data)) {
          const serverNotifications = notifResponse.data;
          setNotifications(serverNotifications);
          await storage.saveNotifications(serverNotifications);
          console.log('Successfully synced users, transactions and notifications with JSON Server');
        }
      } catch (e) {
        console.log('Notifications endpoint failed or not supported:', e.message);
        if (fallbackNotifications) {
          setNotifications(fallbackNotifications);
        }
      }
    } catch (e) {
      console.log('JSON Server not available (offline mode active):', e.message);
      if (currentLocalData) {
        setAllTransactions(currentLocalData);
      }
      if (currentLocalUsers) {
        setUsersList(currentLocalUsers);
      }
      if (fallbackNotifications) {
        setNotifications(fallbackNotifications);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // User Signup
  const signup = async (username, email) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists
    const existing = usersList.find(u => u.email.toLowerCase().trim() === normalizedEmail);
    if (existing) {
      throw new Error('User already exists with this email. Please Login!');
    }

    const newUser = {
      id: Date.now().toString(),
      name: username || 'User',
      email: normalizedEmail,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      currency: 'INR',
      budget: 50000,
    };

    // Load any existing transactions from storage so state gets initialized
    const localTransactions = await storage.getTransactions();
    if (localTransactions && localTransactions.length > 0) {
      setAllTransactions(localTransactions);
    }

    // Load notifications
    const localNotifications = await storage.getNotifications();
    
    // Create welcome notification
    const welcomeNotif = {
      id: `welcome_${Date.now()}`,
      title: 'Welcome to Expense Tracker! 👋',
      message: 'Start managing your personal finances by logging your incomes and expenses.',
      timestamp: new Date().toISOString(),
      type: 'system',
      read: false,
      userEmail: normalizedEmail
    };

    const updatedNotifs = [welcomeNotif, ...localNotifications];
    setNotifications(updatedNotifs);
    await storage.saveNotifications(updatedNotifs);

    try {
      await api.post('/notifications', welcomeNotif);
    } catch (e) {
      console.log('Could not save welcome notification to JSON Server:', e.message);
    }

    // Update state and storage
    const updatedUsers = [...usersList, newUser];
    setUsersList(updatedUsers);
    await storage.saveUsers(updatedUsers);

    setUser(newUser);
    await storage.saveUser(newUser);

    // Save to JSON Server in background
    try {
      await api.post('/users', newUser);
    } catch (e) {
      console.log('Could not save user to JSON Server:', e.message);
    }

    // Sync with server in background to fetch database transactions
    syncWithServer(localTransactions, updatedUsers, updatedNotifs);

    return newUser;
  };

  // User Login
  const login = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists in registered list
    const foundUser = usersList.find(u => u.email.toLowerCase().trim() === normalizedEmail);
    if (!foundUser) {
      throw new Error('User not found. Please Sign Up first!');
    }

    // Load any existing transactions from storage so state gets initialized
    const localTransactions = await storage.getTransactions();
    if (localTransactions && localTransactions.length > 0) {
      setAllTransactions(localTransactions);
    }

    // Load local notifications
    const localNotifications = await storage.getNotifications();
    if (localNotifications && localNotifications.length > 0) {
      setNotifications(localNotifications);
    }

    // Set current user
    setUser(foundUser);
    await storage.saveUser(foundUser);

    // Sync with server in background to fetch database transactions
    syncWithServer(localTransactions, usersList, localNotifications);

    return foundUser;
  };

  // User Logout
  const logout = async () => {
    setUser(null);
    setAllTransactions([]);
    setNotifications([]);
    await storage.saveUser(null); // Log out, but do NOT wipe out other cache lists!
  };

  // Update budget or currency preferences
  const updateProfile = async (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await storage.saveUser(updatedUser);

    // Update inside usersList as well
    const updatedList = usersList.map(u => u.email.toLowerCase().trim() === user.email.toLowerCase().trim() ? updatedUser : u);
    setUsersList(updatedList);
    await storage.saveUsers(updatedList);

    // Update on JSON Server
    try {
      await api.put(`/users/${user.id}`, updatedUser);
    } catch (e) {
      console.log('Could not update profile on server:', e.message);
    }

    // Check budget thresholds immediately in case budget limit changed
    setTimeout(() => {
      checkBudgetThresholds(allTransactions, updatedUser, notifications);
    }, 50);
  };

  // Clear all transactions for the current user locally and on server
  const clearAllTransactions = async () => {
    const userTxs = allTransactions.filter(tx => (tx.userEmail || 'dheeraj@example.com') === user?.email);
    const remainingTxs = allTransactions.filter(tx => (tx.userEmail || 'dheeraj@example.com') !== user?.email);
    
    setAllTransactions(remainingTxs);
    await storage.saveTransactions(remainingTxs);
    try {
      const promises = userTxs.map(t => api.delete(`/transactions/${t.id}`));
      await Promise.all(promises);
    } catch (e) {
      console.log('Error clearing server transactions, but local storage cleared', e.message);
    }
  };

  // Check budget thresholds for alerts
  const checkBudgetThresholds = async (transactionsList, userProfile, currentNotifications) => {
    if (!userProfile || !userProfile.budget) return;
    
    const budgetVal = parseFloat(userProfile.budget);
    if (isNaN(budgetVal) || budgetVal <= 0) return;

    // 1. Calculate current month's expenses
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed

    const currentMonthExpenses = transactionsList
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        if (tx.userEmail !== userProfile.email) return false;
        
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      })
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

    const expenseRatio = currentMonthExpenses / budgetVal;
    const monthKey = `${currentYear}-${currentMonth + 1}`;
    
    const existingNotifications = currentNotifications || notifications;
    
    const hasExceeded80Notif = existingNotifications.some(n => 
      n.userEmail === userProfile.email && 
      n.type === 'budget_warning' && 
      n.timestamp.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`) && 
      n.message.includes('80%')
    );

    const hasExceeded100Notif = existingNotifications.some(n => 
      n.userEmail === userProfile.email && 
      n.type === 'budget_critical' && 
      n.timestamp.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`) && 
      n.message.includes('100%')
    );

    // 2. Trigger notifications if thresholds are crossed and not already logged for this month
    if (expenseRatio >= 1.0 && !hasExceeded100Notif) {
      const title = 'Monthly Budget Blown! 🚨';
      const message = `Alert: You have spent 100% of your ₹${budgetVal.toLocaleString()} budget limit for this month.`;
      
      const newNotif = {
        id: `budget_critical_${monthKey}_${Date.now()}`,
        title,
        message,
        timestamp: new Date().toISOString(),
        type: 'budget_critical',
        read: false,
        userEmail: userProfile.email
      };

      const updated = [newNotif, ...existingNotifications];
      setNotifications(updated);
      await storage.saveNotifications(updated);
      try {
        await api.post('/notifications', newNotif);
      } catch (e) {
        console.log('Could not save critical budget notification to server:', e.message);
      }
    } else if (expenseRatio >= 0.8 && !hasExceeded80Notif && !hasExceeded100Notif) {
      const title = 'Budget Alert (80%) ⚠️';
      const message = `Warning: You have used over 80% of your ₹${budgetVal.toLocaleString()} budget limit.`;
      
      const newNotif = {
        id: `budget_warning_${monthKey}_${Date.now()}`,
        title,
        message,
        timestamp: new Date().toISOString(),
        type: 'budget_warning',
        read: false,
        userEmail: userProfile.email
      };

      const updated = [newNotif, ...existingNotifications];
      setNotifications(updated);
      await storage.saveNotifications(updated);
      try {
        await api.post('/notifications', newNotif);
      } catch (e) {
        console.log('Could not save warning budget notification to server:', e.message);
      }
    }
  };

  // Add Notification
  const addNotification = async (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      read: false,
      userEmail: user?.email || 'dheeraj@example.com'
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    await storage.saveNotifications(updated);

    try {
      await api.post('/notifications', newNotif);
    } catch (e) {
      console.log('Could not save notification to JSON Server:', e.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    const updated = notifications.map(n => 
      n.userEmail === user.email ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await storage.saveNotifications(updated);

    // Update on server in background
    try {
      const unreadUserNotifs = notifications.filter(n => n.userEmail === user.email && !n.read);
      const promises = unreadUserNotifs.map(n => 
        api.put(`/notifications/${n.id}`, { ...n, read: true })
      );
      await Promise.all(promises);
    } catch (e) {
      console.log('Could not update notifications read status on server:', e.message);
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    if (!user) return;
    const remaining = notifications.filter(n => n.userEmail !== user.email);
    const userNotifs = notifications.filter(n => n.userEmail === user.email);
    
    setNotifications(remaining);
    await storage.saveNotifications(remaining);

    try {
      const promises = userNotifs.map(n => api.delete(`/notifications/${n.id}`));
      await Promise.all(promises);
    } catch (e) {
      console.log('Could not clear notifications on server:', e.message);
    }
  };

  // Add Transaction
  const addTransaction = async (txData) => {
    const newTx = {
      id: Date.now().toString(),
      ...txData,
      userEmail: user?.email || 'dheeraj@example.com',
      amount: parseFloat(txData.amount),
      date: txData.date || new Date().toISOString().split('T')[0]
    };

    // 1. Update local state
    const updated = [newTx, ...allTransactions];
    setAllTransactions(updated);
    
    // 2. Save to AsyncStorage
    await storage.saveTransactions(updated);

    // 3. Post to JSON Server in background
    try {
      await api.post('/transactions', newTx);
    } catch (e) {
      console.log('Could not save to JSON Server, saved locally:', e.message);
    }

    // 4. Trigger notification checks
    if (newTx.type === 'expense' && parseFloat(newTx.amount) >= 10000) {
      const title = 'High Expense Alert 💸';
      const message = `A large expense of ₹${parseFloat(newTx.amount).toLocaleString()} was recorded under ${newTx.category}.`;
      const notifId = `high_expense_${Date.now()}`;
      const newNotif = {
        id: notifId,
        title,
        message,
        timestamp: new Date().toISOString(),
        type: 'high_expense',
        read: false,
        userEmail: user?.email || 'dheeraj@example.com'
      };
      
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      await storage.saveNotifications(updatedNotifs);
      try {
        await api.post('/notifications', newNotif);
      } catch (e) {
        console.log('Could not save high expense notification to server:', e.message);
      }
      
      setTimeout(() => {
        checkBudgetThresholds(updated, user, updatedNotifs);
      }, 50);
    } else {
      setTimeout(() => {
        checkBudgetThresholds(updated, user, notifications);
      }, 50);
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id) => {
    // 1. Update local state
    const updated = allTransactions.filter(tx => tx.id !== id);
    setAllTransactions(updated);

    // 2. Save to AsyncStorage
    await storage.saveTransactions(updated);

    // 3. Delete from JSON Server in background
    try {
      await api.delete(`/transactions/${id}`);
    } catch (e) {
      console.log('Could not delete from JSON Server, deleted locally:', e.message);
    }
  };

  // Update Transaction
  const updateTransaction = async (id, updatedTxData) => {
    const originalTx = allTransactions.find(t => t.id === id);
    const updatedTx = {
      ...updatedTxData,
      amount: parseFloat(updatedTxData.amount),
      id: id,
      userEmail: originalTx?.userEmail || user?.email || 'dheeraj@example.com'
    };

    // 1. Update local state
    const updated = allTransactions.map(tx => tx.id === id ? updatedTx : tx);
    setAllTransactions(updated);

    // 2. Save to AsyncStorage
    await storage.saveTransactions(updated);

    // 3. Put to JSON Server in background
    try {
      await api.put(`/transactions/${id}`, updatedTx);
    } catch (e) {
      console.log('Could not update on JSON Server, updated locally:', e.message);
    }

    // 4. Trigger notification checks
    if (updatedTx.type === 'expense' && parseFloat(updatedTx.amount) >= 10000) {
      const title = 'High Expense Alert 💸';
      const message = `A large expense of ₹${parseFloat(updatedTx.amount).toLocaleString()} was updated under ${updatedTx.category}.`;
      const notifId = `high_expense_${Date.now()}`;
      const newNotif = {
        id: notifId,
        title,
        message,
        timestamp: new Date().toISOString(),
        type: 'high_expense',
        read: false,
        userEmail: user?.email || 'dheeraj@example.com'
      };
      
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      await storage.saveNotifications(updatedNotifs);
      try {
        await api.post('/notifications', newNotif);
      } catch (e) {
        console.log('Could not save high expense notification to server:', e.message);
      }
      
      setTimeout(() => {
        checkBudgetThresholds(updated, user, updatedNotifs);
      }, 50);
    } else {
      setTimeout(() => {
        checkBudgetThresholds(updated, user, notifications);
      }, 50);
    }
  };

  return (
    <ExpenseContext.Provider value={{
      user,
      transactions,
      notifications,
      isLoading,
      isSyncing,
      login,
      signup,
      logout,
      updateProfile,
      clearAllTransactions,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      addNotification,
      markAllAsRead,
      clearNotifications,
      syncWithServer: () => syncWithServer(allTransactions, usersList, notifications)
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
