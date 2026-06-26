import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import Header from '../components/Header';
import Button from '../components/Button';

const AddIncomeScreen = ({ navigation }) => {
  const { addTransaction } = useExpense();
  const [loading, setLoading] = useState(false);

  // Pre-fill today's date
  const todayStr = new Date().toISOString().split('T')[0];

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      amount: '',
      source: '',
      date: todayStr,
      note: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await addTransaction({
        amount: parseFloat(data.amount),
        type: 'income',
        category: data.source.trim(), // e.g. Salary, Business
        date: data.date,
        description: data.note.trim()
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
      <Header title="Add Income" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Circular green icon at top */}
          <View style={styles.avatarContainer}>
            <View style={styles.circleBg}>
              <Icon name="wallet" size={36} color="#00875A" />
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

            {/* Source Input */}
            <Text style={styles.label}>Source</Text>
            <Controller
              control={control}
              rules={{ required: 'Source is required' }}
              name="source"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textInput, errors.source && styles.inputError]}
                  placeholder="Salary, Freelance, Business, etc."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#9E9E9E"
                />
              )}
            />
            {errors.source && <Text style={styles.errorText}>{errors.source.message}</Text>}

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

            {/* Note Input */}
            <Text style={styles.label}>Note (Optional)</Text>
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textInput}
                  placeholder="Monthly salary, bonus, etc."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#9E9E9E"
                />
              )}
            />

            {/* Submit Button */}
            <Button 
              title="Add Income" 
              variant="primary" 
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#E8F5E9',
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
});

export default AddIncomeScreen;
