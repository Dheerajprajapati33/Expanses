import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = ({ 
  title, 
  onBack, 
  userName = 'Dheeraj', 
  rightIcon = 'notifications-outline', 
  onRightPress,
  hasUnread = false
}) => {
  if (onBack) {
    return (
      <View style={styles.containerBack}>
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.titleBack}>{title}</Text>
        <View style={styles.rightPlaceholder} />
      </View>
    );
  }

  return (
    <View style={styles.containerGreeting}>
      <View>
        <Text style={styles.greetingText}>Hello, {userName} 👋</Text>
      </View>
      <TouchableOpacity 
        style={styles.iconCircle} 
        onPress={onRightPress}
        activeOpacity={0.7}
      >
        <Icon name={rightIcon} size={22} color="#1A1A1A" />
        {hasUnread && <View style={styles.badge} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Back navigation header styles
  containerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  titleBack: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Outfit-Bold',
  },
  rightPlaceholder: {
    width: 32, // Same width as backButton padding to balance layout
  },

  // Dashboard greeting header styles
  containerGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B1B',
    fontFamily: 'Outfit-Bold',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30', // Red dot badge
  },
});

export default Header;
