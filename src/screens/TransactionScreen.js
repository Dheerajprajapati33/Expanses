import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  SafeAreaView, 
  SectionList, 
  TouchableOpacity,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import TransactionCard from '../components/TransactionCard';
import { groupTransactionsByDate } from '../utils/helper';

const TransactionScreen = ({ navigation }) => {
  const { transactions } = useExpense();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense'

  // Filter and group transactions
  const sections = useMemo(() => {
    // 1. Filter by type & search query
    const filtered = transactions.filter(tx => {
      const matchesType = filterType === 'all' || tx.type === filterType;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        tx.category.toLowerCase().includes(searchLower) || 
        (tx.description && tx.description.toLowerCase().includes(searchLower));

      return matchesType && matchesSearch;
    });

    // 2. Group by date
    return groupTransactionsByDate(filtered);
  }, [transactions, searchQuery, filterType]);

  const handleTransactionPress = (id) => {
    navigation.navigate('EditTransaction', { transactionId: id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Icon name="search-outline" size={20} color="#828282" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions"
          placeholderTextColor="#9E9E9E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color="#828282" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsWrapper}>
        {['all', 'income', 'expense'].map((type) => {
          const isActive = filterType === type;
          const label = type.charAt(0).toUpperCase() + type.slice(1);
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive
              ]}
              onPress={() => setFilterType(type)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                isActive ? styles.chipTextActive : styles.chipTextInactive
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard 
            transaction={item} 
            onPress={() => handleTransactionPress(item.id)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="receipt-outline" size={48} color="#E0E0E0" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No transactions found.</Text>
          </View>
        }
      />
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1B1B',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    marginHorizontal: 24,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1A1A1A',
  },
  chipsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#00875A', // Green active chip
  },
  chipInactive: {
    backgroundColor: '#F5F5F7',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#4F4F4F',
  },
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#828282',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#828282',
  },
});

export default TransactionScreen;
