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
  Alert
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useExpense } from '../context/ExpenseContext';
import Button from '../components/Button';

const LoginScreen = ({ route, navigation }) => {
  const { mode } = route.params || { mode: 'login' };
  const isSignUp = mode === 'signup';
  
  const { login, signup } = useExpense();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      email: '',
    },
    shouldUnregister: true
  });

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (isSignUp) {
        await signup(data.username, data.email);
      } else {
        await login(data.email);
      }
    } catch (e) {
      showAlert('Authentication Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : (Platform.OS === 'web' ? undefined : 'height')}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Sign up to start tracking your daily expenses.' 
                : 'Login to access your tracked expenses.'}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Username Input - Show only for Sign Up */}
            {isSignUp && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <Controller
                  control={control}
                  rules={{ required: 'Full name is required' }}
                  name="username"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.username && styles.inputError]}
                      placeholder="Enter your name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholderTextColor="#9E9E9E"
                    />
                  )}
                />
                {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
              </>
            )}

            {/* Email Input */}
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="name@example.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9E9E9E"
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {/* Submit Button */}
            <Button 
              title={isSignUp ? 'Sign Up' : 'Login'} 
              variant="primary" 
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />

            {/* Switch Mode Button */}
            <Button 
              title={isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"} 
              variant="text" 
              textStyle={styles.switchModeText}
              onPress={() => {
                navigation.setParams({ mode: isSignUp ? 'login' : 'signup' });
              }}
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
    width: '100%',
    height: Platform.OS === 'web' ? '100%' : undefined,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
    width: '100%',
    height: Platform.OS === 'web' ? '100%' : undefined,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00875A',
    marginBottom: 10,
    fontFamily: 'Outfit-Bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
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
    marginTop: 32,
    marginBottom: 8,
  },
  switchModeText: {
    color: '#00875A',
    fontSize: 14,
  },
});

export default LoginScreen;
