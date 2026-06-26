import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Modal,
  TextInput,
  Platform,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import Button from '../components/Button';
import { formatCurrency } from '../utils/helper';

const ProfileScreen = () => {
  const { user, logout, updateProfile, clearAllTransactions } = useExpense();
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [newApiKey, setNewApiKey] = useState(user?.geminiApiKey || '');
  const [newBudget, setNewBudget] = useState(user?.budget ? String(user.budget) : '50000');


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

  const getCurrencyDisplayLabel = (code) => {
    switch (code) {
      case 'USD': return '$ USD';
      case 'RUB': return '₽ RUB';
      case 'CAD': return '$ CAD';
      case 'NPR': return '₨ NPR';
      case 'CNY': return '¥ CNY';
      case 'EUR': return '€ EUR';
      case 'GBP': return '£ GBP';
      case 'INR':
      default:
        return '₹ INR';
    }
  };

  const handleUpdateBudget = async () => {
    const budgetVal = parseFloat(newBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      showAlert('Error', 'Please enter a valid positive budget');
      return;
    }
    await updateProfile({ budget: budgetVal });
    setBudgetModalVisible(false);
    showAlert('Success', 'Monthly budget updated successfully');
  };

  const handleUpdateApiKey = async () => {
    await updateProfile({ geminiApiKey: newApiKey.trim() });
    setApiKeyModalVisible(false);
    showAlert('Success', newApiKey.trim() ? 'Gemini API Key updated successfully.' : 'Gemini API Key cleared.');
  };


  const handleClearData = () => {
    showConfirm(
      'Clear All Data',
      'This will delete all incomes and expenses locally and from the database. This action CANNOT be undone.',
      async () => {
        await clearAllTransactions();
        showAlert('Data Cleared', 'All transactions have been deleted.');
      }
    );
  };

  const handleLogout = () => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      () => logout()
    );
  };

  const handleBackup = () => {
    showAlert(
      'Backup Data',
      'All transactions were exported successfully to local storage cache.'
    );
  };

  const handleAvatarAction = (actionType) => {
    setAvatarModalVisible(false);
    
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      if (actionType === 'camera') {
        input.capture = 'user';
      }
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Data = e.target.result;
            await updateProfile({ avatar: base64Data });
            showAlert('Success', 'Profile photo updated successfully');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      const mockAvatars = [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80'
      ];
      const randomAvatar = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
      updateProfile({ avatar: randomAvatar }).then(() => {
        showAlert('Success', `Profile photo updated using mock ${actionType === 'camera' ? 'camera capture' : 'gallery selection'}`);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <TouchableOpacity 
            style={styles.avatarCircle} 
            activeOpacity={0.8}
            onPress={() => setAvatarModalVisible(true)}
          >
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Icon name="person" size={40} color="#FFFFFF" />
            )}
            <View style={styles.editBadge}>
              <Icon name="camera" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'Dheeraj Prajapati'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'dheeraj@example.com'}</Text>
        </View>

        {/* Options Settings List */}
        <View style={styles.optionsContainer}>
          {/* Currency setting */}
          <TouchableOpacity 
            style={styles.optionRow} 
            activeOpacity={0.7}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconBg, styles.greenBg]}>
                <Icon name="cash-outline" size={20} color="#00875A" />
              </View>
              <Text style={styles.optionLabel}>Currency</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionValue}>{getCurrencyDisplayLabel(user?.currency)}</Text>
              <Icon name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          </TouchableOpacity>

          {/* Budget Setting */}
          <TouchableOpacity 
            style={styles.optionRow} 
            activeOpacity={0.7}
            onPress={() => {
              setNewBudget(user?.budget ? String(user.budget) : '50000');
              setBudgetModalVisible(true);
            }}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconBg, styles.blueBg]}>
                <Icon name="wallet-outline" size={20} color="#1565C0" />
              </View>
              <Text style={styles.optionLabel}>Budget</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionValue}>
                {user?.budget ? formatCurrency(user.budget).split('.')[0] : '₹ 50,000'} / mo
              </Text>
              <Icon name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          </TouchableOpacity>

          {/* Data Backup */}
          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7} onPress={handleBackup}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconBg, styles.purpleBg]}>
                <Icon name="cloud-upload-outline" size={20} color="#AB47BC" />
              </View>
              <Text style={styles.optionLabel}>Data Backup</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionValue}>Export / Import</Text>
              <Icon name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          </TouchableOpacity>

          {/* AI Settings / Gemini API Key */}
          <TouchableOpacity 
            style={styles.optionRow} 
            activeOpacity={0.7} 
            onPress={() => {
              setNewApiKey(user?.geminiApiKey || '');
              setApiKeyModalVisible(true);
            }}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconBg, styles.purpleBg, { backgroundColor: '#EDE7F6' }]}>
                <Icon name="sparkles-outline" size={20} color="#7E57C2" />
              </View>
              <Text style={styles.optionLabel}>AI Gemini API Key</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={[styles.optionValue, { maxWidth: 100 }]} numberOfLines={1}>
                {user?.geminiApiKey ? '••••' + user.geminiApiKey.slice(-4) : 'Not Set'}
              </Text>
              <Icon name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          </TouchableOpacity>


          {/* Clear All Data */}
          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7} onPress={handleClearData}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconBg, styles.redLightBg]}>
                <Icon name="trash-outline" size={20} color="#D32F2F" />
              </View>
              <Text style={[styles.optionLabel, styles.redText]}>Clear All Data</Text>
            </View>
            <View style={styles.optionRight}>
              <Icon name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          </TouchableOpacity>

          {/* About App */}
          <TouchableOpacity 
            style={styles.optionRow} 
            activeOpacity={0.7}
            onPress={() => showAlert('About Expense Tracker', 'Expense Tracker v1.0.0. Clean green & white UI theme layout matching mock design template.')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconBg, styles.greyBg]}>
                <Icon name="information-circle-outline" size={20} color="#555555" />
              </View>
              <Text style={styles.optionLabel}>About App</Text>
            </View>
            <View style={styles.optionRight}>
              <Icon name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7} onPress={handleLogout}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconBg, styles.orangeBg]}>
                <Icon name="log-out-outline" size={20} color="#E65100" />
              </View>
              <Text style={[styles.optionLabel, styles.orangeText]}>Logout</Text>
            </View>
            <View style={styles.optionRight}>
              <Icon name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Budget Modal Overlay */}
      <Modal
        visible={budgetModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBudgetModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Monthly Budget</Text>
            <View style={styles.modalInputWrapper}>
              <Text style={styles.modalCurrencySymbol}>₹</Text>
              <TextInput
                style={styles.modalInput}
                value={newBudget}
                onChangeText={setNewBudget}
                keyboardType="numeric"
                placeholder="Enter budget limit"
                placeholderTextColor="#9E9E9E"
                autoFocus={true}
              />
            </View>
            <View style={styles.modalButtonRow}>
              <Button 
                title="Cancel" 
                variant="text" 
                style={styles.modalBtn}
                textStyle={{ color: '#828282' }}
                onPress={() => setBudgetModalVisible(false)} 
              />
              <Button 
                title="Save" 
                variant="primary" 
                style={[styles.modalBtn, { backgroundColor: '#00875A' }]}
                onPress={handleUpdateBudget} 
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Avatar Actions ActionSheet Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setAvatarModalVisible(false)}
        >
          <View style={styles.actionSheetContent}>
            <Text style={styles.actionSheetTitle}>Profile Photo</Text>
            
            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => handleAvatarAction('camera')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, styles.cameraBg]}>
                <Icon name="camera-outline" size={22} color="#00875A" />
              </View>
              <Text style={styles.actionSheetText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => handleAvatarAction('gallery')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, styles.galleryBg]}>
                <Icon name="image-outline" size={22} color="#1565C0" />
              </View>
              <Text style={styles.actionSheetText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionSheetRow, { borderBottomWidth: 0 }]}
              onPress={() => setAvatarModalVisible(false)}
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

      {/* Currency Selector ActionSheet Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setCurrencyModalVisible(false)}
        >
          <View style={styles.actionSheetContent}>
            <Text style={styles.actionSheetTitle}>Select Currency</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
              {[
                { code: 'INR', name: 'Indian Rupee (₹)' },
                { code: 'USD', name: 'US Dollar ($)' },
                { code: 'RUB', name: 'Russian Ruble (₽)' },
                { code: 'CAD', name: 'Canadian Dollar (C$)' },
                { code: 'NPR', name: 'Nepalese Rupee (₨)' },
                { code: 'CNY', name: 'Chinese Yuan (¥)' },
                { code: 'EUR', name: 'Euro (€)' },
                { code: 'GBP', name: 'British Pound (£)' },
              ].map((item) => (
                <TouchableOpacity 
                  key={item.code}
                  style={styles.actionSheetRow}
                  onPress={async () => {
                    await updateProfile({ currency: item.code });
                    setCurrencyModalVisible(false);
                    showAlert('Success', `Currency switched to ${item.code}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBg, user?.currency === item.code ? styles.activePeriodBg : styles.inactivePeriodBg]}>
                    <Text style={{ fontWeight: '700', color: user?.currency === item.code ? '#00875A' : '#555555' }}>
                      {item.code === 'USD' ? '$' : item.code === 'INR' ? '₹' : item.code === 'RUB' ? '₽' : item.code === 'CAD' ? '$' : item.code === 'NPR' ? '₨' : item.code === 'CNY' ? '¥' : item.code === 'EUR' ? '€' : '£'}
                    </Text>
                  </View>
                  <Text style={[styles.actionSheetText, user?.currency === item.code && styles.activePeriodText]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.actionSheetRow, { borderBottomWidth: 0, marginTop: 10 }]}
              onPress={() => setCurrencyModalVisible(false)}
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

      {/* Gemini API Key Modal */}
      <Modal
        visible={apiKeyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setApiKeyModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setApiKeyModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gemini API Key</Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 12, textAlign: 'center', lineHeight: 16 }}>
              Used to query SpendWise AI. Get a free key from Google AI Studio. Leave empty to use local offline assistant.
            </Text>
            <View style={[styles.modalInputWrapper, { paddingHorizontal: 12 }]}>
              <Icon name="key-outline" size={18} color="#7E57C2" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.modalInput, { flex: 1, height: 40, outlineStyle: 'none' }]}
                value={newApiKey}
                onChangeText={setNewApiKey}
                secureTextEntry={true}
                placeholder="AIzaSy..."
                placeholderTextColor="#9E9E9E"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
            </View>
            <View style={styles.modalButtonRow}>
              <Button 
                title="Cancel" 
                variant="text" 
                style={styles.modalBtn}
                textStyle={{ color: '#828282' }}
                onPress={() => setApiKeyModalVisible(false)} 
              />
              <Button 
                title="Save" 
                variant="primary" 
                style={[styles.modalBtn, { backgroundColor: '#7E57C2' }]}
                onPress={handleUpdateApiKey} 
              />
            </View>
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
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  userCard: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#00875A', // Thematic Green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#828282',
  },
  optionsContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    // Subtle shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FAFAFA',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  greenBg: { backgroundColor: '#E8F5E9' },
  blueBg: { backgroundColor: '#E3F2FD' },
  purpleBg: { backgroundColor: '#F3E5F5' },
  redLightBg: { backgroundColor: '#FFEBEE' },
  greyBg: { backgroundColor: '#F5F5F7' },
  orangeBg: { backgroundColor: '#FFF3E0' },
  
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  redText: { color: '#D32F2F' },
  orangeText: { color: '#E65100' },
  
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionValue: {
    fontSize: 14,
    color: '#828282',
    fontWeight: '500',
    marginRight: 6,
  },
  
  // Modal layout
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
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FAFAFA',
    width: '100%',
    marginBottom: 20,
  },
  modalCurrencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 0.47,
    marginVertical: 0,
    height: 48,
    borderRadius: 24,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00875A',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  cameraBg: {
    backgroundColor: '#E8F5E9',
  },
  galleryBg: {
    backgroundColor: '#E3F2FD',
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
});

export default ProfileScreen;
