import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import Header from '../components/Header';
import Button from '../components/Button';
import { getCategoryConfig } from '../utils/helper';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Others'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];

const EditTransactionScreen = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const { transactions, updateTransaction, deleteTransaction } = useExpense();
  
  const [loading, setLoading] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const showConfirm = (title, message, onConfirm) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        onConfirm();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', style: 'destructive', onPress: onConfirm }
        ]
      );
    }
  };

  // 1. Locate current transaction
  const tx = transactions.find(t => t.id === transactionId);

  // 2. Initialize Form (must run before early return to obey React hook rules)
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      type: tx?.type || 'expense',
      amount: tx ? String(tx.amount) : '',
      category: tx?.category || 'Food',
      date: tx?.date || '',
      description: tx?.description || ''
    }
  });

  useEffect(() => {
    if (!tx) {
      showAlert('Error', 'Transaction not found');
      navigation.goBack();
    }
  }, [tx, navigation]);

  if (!tx) return null;

  const selectedType = watch('type');
  const selectedCategory = watch('category');
  const catConfig = getCategoryConfig(selectedCategory, selectedType);

  // Handle Type switch to pre-populate correct default category
  const handleTypeChange = (type) => {
    setValue('type', type);
    setValue('category', type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setTypePickerVisible(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateTransaction(transactionId, {
        amount: parseFloat(data.amount),
        type: data.type,
        category: data.category,
        date: data.date,
        description: data.description.trim()
      });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      async () => {
        try {
          await deleteTransaction(transactionId);
          navigation.goBack();
        } catch (e) {
          console.error(e);
        }
      }
    );
  };

  const categoryList = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Transaction" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Theme Circle Indicator */}
          <View style={styles.avatarContainer}>
            <View style={[styles.circleBg, { backgroundColor: '#FFE0B2' }]}>
              <Icon name={catConfig.icon || "restaurant-outline"} size={36} color="#EF6C00" />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Type Input */}
            <Text style={styles.label}>Type</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setTypePickerVisible(true)}
              style={styles.pickerTrigger}
            >
              <Text style={styles.pickerTriggerText}>
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
              </Text>
              <Icon name="chevron-down" size={20} color="#828282" />
            </TouchableOpacity>

            {/* Amount Input */}
            <Text style={styles.label}>Amount</Text>
            <Controller
              control={control}
              rules={{ 
                required: 'Amount is required',
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Enter a valid amount (e.g. 500 or 500.50)'
                },
                validate: value => parseFloat(value) > 0 || 'Amount must be greater than 0'
              }}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.amount && styles.inputWrapperError]}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.flexInput}
                    placeholder="0"
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              )}
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

            {/* Category Dropdown */}
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setCategoryPickerVisible(true)}
              style={styles.pickerTrigger}
            >
              <Text style={styles.pickerTriggerText}>{selectedCategory}</Text>
              <Icon name="chevron-down" size={20} color="#828282" />
            </TouchableOpacity>

            {/* Date Input */}
            <Text style={styles.label}>Date</Text>
            <Controller
              control={control}
              rules={{ required: 'Date is required' }}
              name="date"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.date && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.flexInput}
                    placeholder="YYYY-MM-DD"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#9E9E9E"
                  />
                  <Icon name="calendar-outline" size={20} color="#828282" style={styles.inputIcon} />
                </View>
              )}
            />
            {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}

            {/* Description Input */}
            <Text style={styles.label}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textInput}
                  placeholder="Details about the transaction"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#9E9E9E"
                />
              )}
            />

            {/* Buttons Section */}
            <Button 
              title="Update Transaction" 
              variant="warning" 
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />

            <Button 
              title="Delete Transaction" 
              variant="text" 
              onPress={handleDelete}
              style={styles.deleteBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Type Modal Picker */}
      <Modal
        visible={typePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypePickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Type</Text>
            {['income', 'expense'].map((type) => (
              <TouchableOpacity 
                key={type}
                style={[
                  styles.categoryItem, 
                  type === selectedType && styles.categoryItemActive
                ]}
                onPress={() => handleTypeChange(type)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryItemText,
                  type === selectedType && styles.categoryItemTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                {type === selectedType && (
                  <Icon name="checkmark" size={20} color="#EF6C00" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Modal Picker */}
      <Modal
        visible={categoryPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={categoryList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.categoryItem, 
                    item === selectedCategory && styles.categoryItemActive
                  ]}
                  onPress={() => {
                    setValue('category', item);
                    setCategoryPickerVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryItemText,
                    item === selectedCategory && styles.categoryItemTextActive
                  ]}>{item}</Text>
                  {item === selectedCategory && (
                    <Icon name="checkmark" size={20} color="#EF6C00" />
                  )}
                </TouchableOpacity>
              )}
            />
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  circleBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#828282',
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  inputWrapperError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  flexInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputIcon: {
    marginLeft: 8,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  pickerTriggerText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  submitBtn: {
    marginTop: 36,
  },
  deleteBtn: {
    marginTop: 10,
  },
  
  // Modal overlay styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    maxHeight: '60%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  categoryItemActive: {
    backgroundColor: '#FFE0B2',
  },
  categoryItemText: {
    fontSize: 15,
    color: '#4F4F4F',
    fontWeight: '500',
  },
  categoryItemTextActive: {
    color: '#EF6C00',
    fontWeight: '700',
  },
});

export default EditTransactionScreen;
