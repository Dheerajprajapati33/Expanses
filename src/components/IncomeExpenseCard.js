import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../utils/helper';
import { useExpense } from '../context/ExpenseContext';

const IncomeExpenseCard = ({ totalIncome = 35000.00, totalExpenses = 14550.00 }) => {
  const { user } = useExpense();
  return (
    <View style={styles.container}>
      {/* Income Card */}
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.label}>Total Income</Text>
          <Text style={styles.incomeAmount}>{formatCurrency(totalIncome, user?.currency)}</Text>
        </View>
        <View style={[styles.iconContainer, styles.incomeIconBg]}>
          <Icon name="arrow-down-outline" size={16} color="#2E7D32" style={styles.flippedIcon} />
        </View>
      </View>

      {/* Expense Card */}
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.label}>Total Expenses</Text>
          <Text style={styles.expenseAmount}>{formatCurrency(totalExpenses, user?.currency)}</Text>
        </View>
        <View style={[styles.iconContainer, styles.expenseIconBg]}>
          <Icon name="arrow-down-outline" size={16} color="#D32F2F" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  card: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Rounded cards (20px radius)
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Modern shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardInfo: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#828282',
    marginBottom: 4,
    fontWeight: '500',
  },
  incomeAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  incomeIconBg: {
    backgroundColor: '#E8F5E9',
  },
  expenseIconBg: {
    backgroundColor: '#FFEBEE',
  },
  flippedIcon: {
    transform: [{ rotate: '180deg' }], // Flipped to point up for Income
  },
});

export default IncomeExpenseCard;
