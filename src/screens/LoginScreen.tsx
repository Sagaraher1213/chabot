import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// User interface based on API response
interface User {
  user_id: number;
  user_name: string;
  email: string;
  mobile: string;
  profile_pic: string;
  role_abbreviation: string;
  status: number;
  is_verified: number;
  is_available: number;
  ClientId: number;
  created_at: string;
  updated_at: string;
}

interface LoginScreenProps {
  onLogin: (userData: User) => void;
  navigation?: any;
  route?: any;
}

// Enhanced Icon Components with gradients
const EmailIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
    <Defs>
      <LinearGradient id="emailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#667eea" />
        <Stop offset="100%" stopColor="#764ba2" />
      </LinearGradient>
    </Defs>
    <Path
      d="M4 4h16a2 2 0 0 1 2 2v1l-10 6L2 7V6a2 2 0 0 1 2-2Zm0 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8 5-8-5Z"
      stroke="url(#emailGradient)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LockIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
    <Defs>
      <LinearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#667eea" />
        <Stop offset="100%" stopColor="#764ba2" />
      </LinearGradient>
    </Defs>
    <Path
      d="M17 11H7V7a5 5 0 0 1 10 0v4ZM5 11h14v10H5V11Z"
      stroke="url(#lockGradient)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      stroke="#8e9aaf"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOffIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A9.94 9.94 0 0 1 12 19c-7 0-11-7-11-7a18.6 18.6 0 0 1 5.07-5.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12M1 1l22 22"
      stroke="#8e9aaf"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLoginCallback = onLogin || route?.params?.onLogin;

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      if (savedEmail && savedRememberMe === 'true') {
        setEmail(savedEmail);
        setRememberMe(true);
        if (savedPassword) {
          setPassword(savedPassword);
        }
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userPassword');
        await AsyncStorage.removeItem('rememberMe');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const saveUserData = async (userData: User) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('lastLoginTime', new Date().toISOString());
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        'https://api.ataichatbot.mcndhanore.co.in/public/api/verify-user-credentials',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        }
      );

      const resData = await response.json();
      console.log('Login Response:', resData);

      if (response.ok && resData.status === 'success' && resData.data) {
        const userData = resData.data;
        await saveUserData(userData);
        await saveCredentials(email.trim(), password);
        Alert.alert('Welcome Back!', 'Login successful!');
        if (handleLoginCallback) {
          handleLoginCallback(userData);
        }
      } else {
        Alert.alert('Login Failed', resData.message || 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Connection Error', 'Unable to connect to server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background Decorations */}
        <View style={styles.backgroundDecoration1} />
        <View style={styles.backgroundDecoration2} />
        
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoPlaceholder}>
              <Image
                source={require('../assets/images/logo1.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.appName}>ATAI Chatbot</Text>
          <Text style={styles.tagline}>Your AI Assistant</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subText}>Sign in to continue your journey</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={[
            styles.inputContainer,
            emailFocused && styles.inputFocused,
            !isValidEmail(email) && email.length > 0 && styles.inputError
          ]}>
            <EmailIcon />
            <TextInput
              style={styles.textInput}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#a0a0a0"
              editable={!isLoading}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password Input */}
          <View style={[
            styles.passwordContainer,
            passwordFocused && styles.inputFocused
          ]}>
            <LockIcon />
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#a0a0a0"
              editable={!isLoading}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              disabled={isLoading} 
              style={styles.eyeButton}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </TouchableOpacity>
          </View>

          {/* Remember Me */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.checkbox} 
              onPress={() => setRememberMe(!rememberMe)} 
              disabled={isLoading}
            >
              <View style={[styles.checkboxInner, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin} 
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
                  <Text style={styles.buttonText}>login In...</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>login</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Additional Options */}
          {/* <View style={styles.additionalOptions}>
            <TouchableOpacity>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
    minHeight: height,
  },
  backgroundDecoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 110,
    height: 110,
    backgroundColor: '#ffffff',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    top: -5,
    left: -5,
    zIndex: -1,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2d3748',
  },
  subText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    height: 60,
  },
  inputFocused: {
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    height: 60,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 15,
    color: '#4a5568',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  additionalOptions: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;