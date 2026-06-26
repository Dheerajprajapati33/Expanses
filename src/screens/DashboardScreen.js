import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  Animated,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import IncomeExpenseCard from '../components/IncomeExpenseCard';
import PieChart from '../components/PieChart';
import TransactionCard from '../components/TransactionCard';

const DashboardScreen = ({ navigation }) => {
  const { user, transactions, notifications } = useExpense();
  const [modalVisible, setModalVisible] = useState(false);
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('month'); // 'week' | 'month' | 'all'
  const [fadeAnim] = useState(new Animated.Value(0));

  const hasUnread = notifications
    .filter(n => n.userEmail === user?.email)
    .some(n => !n.read);

  // 1. Calculate values
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'income') {
      totalIncome += amt;
    } else {
      totalExpenses += amt;
    }
  });

  const totalBalance = totalIncome - totalExpenses;

  // Calculate current month's expenses for budget usage card
  const monthlyBudget = user?.budget || 50000;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const currentMonthExpenses = transactions
    .filter(tx => {
      if (tx.type !== 'expense') return false;
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    })
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

  const budgetUsagePercent = Math.min((currentMonthExpenses / monthlyBudget) * 100, 100);
  const budgetUsagePercentFormatted = ((currentMonthExpenses / monthlyBudget) * 100).toFixed(1);

  // 2. Get recent transactions (top 3)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Filter expenses based on selected period
  const filteredExpensesForChart = useMemo(() => {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();

    return transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      
      const txDate = new Date(tx.date);
      if (filterPeriod === 'week') {
        // Last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return txDate >= sevenDaysAgo && txDate <= now;
      } else if (filterPeriod === 'month') {
        // Current calendar month
        return txDate.getFullYear() === nowYear && txDate.getMonth() === nowMonth;
      }
      // 'all'
      return true;
    });
  }, [transactions, filterPeriod]);

  const getPeriodLabel = () => {
    if (filterPeriod === 'week') return 'This Week';
    if (filterPeriod === 'month') return 'This Month';
    return 'All Time';
  };

  // 3. Show/hide animated menu overlay
  const toggleMenu = (visible) => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  };

  const handleAction = (screenName) => {
    toggleMenu(false);
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header 
        userName={user?.name ? user.name.split(' ')[0] : 'Dheeraj'} 
        onRightPress={() => navigation.navigate('Notifications')}
        hasUnread={hasUnread}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <BalanceCard totalBalance={totalBalance} />

        {/* Income / Expense split row */}
        <IncomeExpenseCard totalIncome={totalIncome} totalExpenses={totalExpenses} />

        {/* Ask SpendWise AI Card */}
        <TouchableOpacity 
          style={styles.aiCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AIChat')}
        >
          <View style={styles.aiCardHeader}>
            <View style={styles.aiTitleContainer}>
              <Icon name="sparkles" size={18} color="#9575CD" style={{ marginRight: 6 }} />
              <Text style={styles.aiCardTitle}>Ask SpendWise AI</Text>
            </View>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI Assistant</Text>
            </View>
          </View>
          
          <Text style={styles.aiCardDescription}>
            Get instant personal insights on your budget, spending habits, and smart suggestions to save money.
          </Text>

          <View style={styles.aiCardFooter}>
            <Text style={styles.aiActionText}>Consult Advisor</Text>
            <Icon name="arrow-forward" size={16} color="#9575CD" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>

        {/* Budget Progress Bar */}

        {monthlyBudget > 0 && (
          <TouchableOpacity 
            style={styles.budgetCard} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.budgetHeader}>
              <View style={styles.budgetTitleContainer}>
                <Icon name="wallet-outline" size={18} color="#00875A" style={{ marginRight: 6 }} />
                <Text style={styles.budgetCardTitle}>Monthly Budget Limit</Text>
              </View>
              <Text style={styles.budgetPercentText}>
                {budgetUsagePercentFormatted}% Used
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${budgetUsagePercent}%`,
                    backgroundColor: 
                      budgetUsagePercent >= 100 ? '#D32F2F' : 
                      budgetUsagePercent >= 80 ? '#E65100' : 
                      '#00875A' 
                  }
                ]} 
              />
            </View>

            <View style={styles.budgetFooter}>
              <Text style={styles.budgetSpentText}>
                Spent: <Text style={styles.budgetHighlightText}>₹{currentMonthExpenses.toLocaleString()}</Text> of ₹{monthlyBudget.toLocaleString()}
              </Text>
              <Text style={styles.budgetRemainingText}>
                {monthlyBudget - currentMonthExpenses > 0 ? (
                  `₹${(monthlyBudget - currentMonthExpenses).toLocaleString()} left`
                ) : (
                  'Over budget!'
                )}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Expense Breakdown / Overview Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Expenses Overview</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn} 
            activeOpacity={0.7}
            onPress={() => setPeriodModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{getPeriodLabel()}</Text>
            <Icon name="chevron-down" size={16} color="#828282" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Donut Chart Component */}
        <PieChart transactions={filteredExpensesForChart} />

        {/* Recent Transactions List Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('TransactionsTab')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions List */}
        {recentTransactions.length > 0 ? (
          recentTransactions.map(tx => (
            <TransactionCard 
              key={tx.id} 
              transaction={tx} 
              onPress={() => navigation.navigate('EditTransaction', { transactionId: tx.id })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent transactions found.</Text>
          </View>
        )}
        
        {/* Extra spacing at bottom for FAB padding */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => toggleMenu(true)}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Plus Quick Action Modal Menu */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => toggleMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => toggleMenu(false)}
        >
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <Text style={styles.modalTitle}>Choose Action</Text>
            
            <View style={styles.menuRow}>
              {/* Income */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleAction('AddIncome')}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconCircle, styles.incomeBg]}>
                  <Icon name="wallet-outline" size={24} color="#2E7D32" />
                </View>
                <Text style={styles.menuText}>Add Income</Text>
              </TouchableOpacity>

              {/* Expense */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleAction('AddExpense')}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconCircle, styles.expenseBg]}>
                  <Icon name="card-outline" size={24} color="#D32F2F" />
                </View>
                <Text style={styles.menuText}>Add Expense</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => toggleMenu(false)}
            >
              <Icon name="close" size={22} color="#828282" />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Chart Period Selector Modal */}
      <Modal
        visible={periodModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setPeriodModalVisible(false)}
        >
          <View style={styles.actionSheetContent}>
            <Text style={styles.actionSheetTitle}>Select Filter Period</Text>
            
            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => {
                setFilterPeriod('week');
                setPeriodModalVisible(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, filterPeriod === 'week' ? styles.activePeriodBg : styles.inactivePeriodBg]}>
                <Icon name="calendar-outline" size={22} color={filterPeriod === 'week' ? '#00875A' : '#555555'} />
              </View>
              <Text style={[styles.actionSheetText, filterPeriod === 'week' && styles.activePeriodText]}>This Week</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => {
                setFilterPeriod('month');
                setPeriodModalVisible(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, filterPeriod === 'month' ? styles.activePeriodBg : styles.inactivePeriodBg]}>
                <Icon name="calendar-outline" size={22} color={filterPeriod === 'month' ? '#00875A' : '#555555'} />
              </View>
              <Text style={[styles.actionSheetText, filterPeriod === 'month' && styles.activePeriodText]}>This Month</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => {
                setFilterPeriod('all');
                setPeriodModalVisible(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, filterPeriod === 'all' ? styles.activePeriodBg : styles.inactivePeriodBg]}>
                <Icon name="infinite-outline" size={22} color={filterPeriod === 'all' ? '#00875A' : '#555555'} />
              </View>
              <Text style={[styles.actionSheetText, filterPeriod === 'all' && styles.activePeriodText]}>All Time</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionSheetRow, { borderBottomWidth: 0 }]}
              onPress={() => setPeriodModalVisible(false)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, styles.cancelBg]}>
                <Icon name="close" size={22} color="#555555" />
              </View>
              <Text style={[styles.actionSheetText, { color: '#555555' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 14,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  dropdownText: {
    fontSize: 13,
    color: '#4F4F4F',
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00875A',
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#828282',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00875A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  
  // Overlay Quick Menu styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 34,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeBg: {
    backgroundColor: '#E8F5E9',
  },
  expenseBg: {
    backgroundColor: '#FFEBEE',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F4F4F',
  },
  closeBtn: {
    marginTop: 16,
    padding: 8,
  },
  budgetCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    // Shadows
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F7',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#828282',
  },
  budgetPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '100%',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetSpentText: {
    fontSize: 12,
    color: '#828282',
  },
  budgetHighlightText: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  budgetRemainingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  actionSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cancelBg: {
    backgroundColor: '#F5F5F7',
  },
  actionSheetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activePeriodBg: {
    backgroundColor: '#E8F5E9',
  },
  inactivePeriodBg: {
    backgroundColor: '#F5F5F7',
  },
  activePeriodText: {
    color: '#00875A',
    fontWeight: '700',
  },
  aiCard: {
    backgroundColor: '#1E1E2C', // Modern dark purple/indigo
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    // Shadows
    shadowColor: '#5E35B1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#312E43',
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiBadge: {
    backgroundColor: 'rgba(149, 117, 205, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B39DDB',
  },
  aiCardDescription: {
    fontSize: 13,
    color: '#A2A2B5',
    lineHeight: 18,
    marginBottom: 12,
  },
  aiCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  aiActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B39DDB',
  },
});


export default DashboardScreen;
