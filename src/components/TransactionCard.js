import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatCurrency, getCategoryConfig, formatDate, getCurrencySymbol } from '../utils/helper';
import { useExpense } from '../context/ExpenseContext';

const TransactionCard = ({ transaction, onPress }) => {
  const { user } = useExpense();
  const { amount, type, category, description, date } = transaction;
  const config = getCategoryConfig(category, type);

  const isIncome = type === 'income';

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={styles.cardContainer}
    >
      <View style={styles.leftSection}>
        {/* Category Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Icon name={config.icon} size={22} color={config.iconColor} />
        </View>
        
        {/* Description & Category */}
        <View style={styles.detailsContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <Text style={styles.descriptionText} numberOfLines={1}>
            {description || (isIncome ? 'Income Source' : 'Expense Detail')}
          </Text>
        </View>
      </View>

      {/* Amount & Date */}
      <View style={styles.rightSection}>
        <Text style={[styles.amountText, isIncome ? styles.incomeColor : styles.expenseColor]}>
          {isIncome ? '+' : '-'} {formatCurrency(amount, user?.currency).replace(`${getCurrencySymbol(user?.currency)} `, getCurrencySymbol(user?.currency))}
        </Text>
        <Text style={styles.dateText}>
          {formatDate(date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Subtle shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.65,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  descriptionText: {
    fontSize: 13,
    color: '#828282',
  },
  rightSection: {
    alignItems: 'flex-end',
    flex: 0.35,
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  incomeColor: {
    color: '#2E7D32', // Green
  },
  expenseColor: {
    color: '#D32F2F', // Red
  },
  dateText: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});

export default TransactionCard;
