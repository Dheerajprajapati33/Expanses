import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Platform } from 'react-native';
import Button from '../components/Button';
import walletImg from '../assets/images/wallet.png';

const SplashScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Wallet Illustration Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={typeof walletImg === 'string' ? { uri: walletImg } : walletImg} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Expense Tracker</Text>
          <Text style={styles.subtitle}>
            Track your expenses and manage your money better
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Login" 
            variant="primary" 
            onPress={() => navigation.navigate('Login', { mode: 'login' })} 
          />
          <Button 
            title="Sign Up" 
            variant="secondary" 
            onPress={() => navigation.navigate('Login', { mode: 'signup' })} 
          />
        </View>

        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    width: '100%',
    height: Platform.OS === 'web' ? '100%' : undefined,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 150,
  },
  image: {
    width: '85%',
    height: '85%',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00875A', // Thematic Green
    fontFamily: 'Outfit-Bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4F4F4F',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#00875A',
    width: 20, // Slightly stretched active dot
  },
});

export default SplashScreen;
