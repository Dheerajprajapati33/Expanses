import React, { useState } from 'react';
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
  FlatList
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import Header from '../components/Header';
import Button from '../components/Button';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];

const AddExpenseScreen = ({ navigation }) => {
  const { addTransaction } = useExpense();
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  // Pre-fill today's date
  const todayStr = new Date().toISOString().split('T')[0];

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      amount: '',
      category: 'Food',
      date: todayStr,
      description: ''
    }
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await addTransaction({
        amount: parseFloat(data.amount),
        type: 'expense',
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back navigation */}
      <Header title="Add Expense" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Circular red icon at top */}
          <View style={styles.avatarContainer}>
            <View style={styles.circleBg}>
              <Icon name="card" size={36} color="#D32F2F" />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            {/* Category Dropdown/Selector */}
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setPickerVisible(true)}
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
            <Text style={styles.label}>Description (Optional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textInput}
                  placeholder="Lunch at cafe, grociers, bill, etc."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#9E9E9E"
                />
              )}
            />

            {/* Submit Button */}
            <Button 
              title="Add Expense" 
              variant="danger" 
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Custom Modal Picker */}
      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.categoryItem, 
                    item === selectedCategory && styles.categoryItemActive
                  ]}
                  onPress={() => {
                    setValue('category', item);
                    setPickerVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryItemText,
                    item === selectedCategory && styles.categoryItemTextActive
                  ]}>{item}</Text>
                  {item === selectedCategory && (
                    <Icon name="checkmark" size={20} color="#D32F2F" />
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
    backgroundColor: '#FFEBEE',
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
  
  // Custom picker overlay styles
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
    backgroundColor: '#FFEBEE',
  },
  categoryItemText: {
    fontSize: 15,
    color: '#4F4F4F',
    fontWeight: '500',
  },
  categoryItemTextActive: {
    color: '#D32F2F',
    fontWeight: '700',
  },
});

export default AddExpenseScreen;
