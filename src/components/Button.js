import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'warning' | 'text'
  loading = false,
  disabled = false,
  style = {},
  textStyle = {} 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'warning':
        return styles.warningBtn;
      case 'text':
        return styles.textBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryTxt;
      case 'secondary':
        return styles.secondaryTxt;
      case 'danger':
        return styles.dangerTxt;
      case 'warning':
        return styles.warningTxt;
      case 'text':
        return styles.textTxt;
      default:
        return styles.primaryTxt;
    }
  };

  const isBtnDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isBtnDisabled}
      style={[
        styles.btnBase, 
        getButtonStyle(), 
        isBtnDisabled && styles.disabledBtn,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' || variant === 'text' ? '#2E7D32' : '#FFFFFF'} 
        />
      ) : (
        <Text style={[styles.txtBase, getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnBase: {
    height: 56,
    borderRadius: 28, // Round buttons
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  txtBase: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#00875A', // Beautiful green
  },
  primaryTxt: {
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#00875A',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  secondaryTxt: {
    color: '#00875A',
  },
  dangerBtn: {
    backgroundColor: '#D32F2F', // Strong red
  },
  dangerTxt: {
    color: '#FFFFFF',
  },
  warningBtn: {
    backgroundColor: '#EF6C00', // Rich orange
  },
  warningTxt: {
    color: '#FFFFFF',
  },
  textBtn: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    height: 48,
  },
  textTxt: {
    color: '#D32F2F', // Default text btn color is red for Delete
    fontWeight: '500',
  },
  disabledBtn: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default Button;
