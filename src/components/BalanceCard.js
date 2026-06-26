import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatCurrency, getCurrencySymbol } from '../utils/helper';
import { useExpense } from '../context/ExpenseContext';

const BalanceCard = ({ totalBalance = 20450.00 }) => {
  const { user } = useExpense();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Total Balance</Text>
        <TouchableOpacity 
          onPress={() => setShowBalance(!showBalance)}
          activeOpacity={0.7}
          style={styles.eyeBtn}
        >
          <Icon 
            name={showBalance ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.balanceText}>
        {showBalance ? formatCurrency(totalBalance, user?.currency) : `${user?.currency ? getCurrencySymbol(user.currency) : '₹'} ••••••••`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#00875A', // Premium forest green
    borderRadius: 20, // Rounded cards (20px radius)
    padding: 24,
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
    // Modern shadow
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#E0F2F1', // Light mint green text
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  eyeBtn: {
    marginLeft: 10,
    padding: 2,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
  },
});

export default BalanceCard;
