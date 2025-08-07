// src/screens/SplashScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Animated, 
  Dimensions,
  StatusBar,
  Easing
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Animated Loading Dots Component
const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const duration = 600;
      const delay = 200;

      Animated.sequence([
        Animated.timing(dot1, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
        Animated.timing(dot1, {
          toValue: 0,
          duration,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
      ]).start();

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot2, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
        ]).start();
      }, delay);

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot3, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
        ]).start();
      }, delay * 2);
    };

    animateDots();
    const interval = setInterval(animateDots, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot1,
            transform: [
              {
                scale: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot2,
            transform: [
              {
                scale: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot3,
            transform: [
              {
                scale: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

// Background Animation Component
const BackgroundAnimation: React.FC = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.backgroundCircle, { transform: [{ rotate }] }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="rgba(102, 126, 234, 0.1)" />
            <Stop offset="50%" stopColor="rgba(118, 75, 162, 0.1)" />
            <Stop offset="100%" stopColor="rgba(102, 126, 234, 0.1)" />
          </LinearGradient>
        </Defs>
        <Circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#bgGradient)"
          stroke="rgba(102, 126, 234, 0.2)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </Svg>
    </Animated.View>
  );
};

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set status bar style
    StatusBar.setBarStyle('light-content', true);
    
    // Start animations
    Animated.sequence([
      // Container fade in
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      // Logo animation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
      // Text animation
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
    ]).start();

    // Navigate to login after animation completes
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }).start(() => {
        navigation.navigate('Login' as never);
        console.log('Splash animation completed');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar backgroundColor="#667eea" barStyle="light-content" />
      
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Background Decorations */}
      <View style={styles.backgroundDecoration1} />
      <View style={styles.backgroundDecoration2} />
      <View style={styles.backgroundDecoration3} />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logoPlaceholder}>
              <Image
                source={require('../assets/images/logo1.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.logoRing} />
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appTitle}>ATAI ChatBot</Text>
          <Text style={styles.tagline}>Your Intelligent Assistant</Text>
          <Text style={styles.welcomeText}>Welcome to the Future ATAI</Text>
        </Animated.View>

        {/* Loading Animation */}
        <Animated.View
          style={[
            styles.loadingSection,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <LoadingDots />
          <Text style={styles.loadingText}>Initializing AI...</Text>
        </Animated.View>
      </View>

      {/* Bottom Branding */}
      <Animated.View
        style={[
          styles.bottomBranding,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.brandingText}>Powered by ATJOIN PVT. LTD</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: height * 0.1,
    left: width * 0.5 - 150,
  },
  backgroundDecoration1: {
    position: 'absolute',
    top: 80,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    top: 200,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backgroundDecoration3: {
    position: 'absolute',
    bottom: 150,
    right: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  logoPlaceholder: {
    width: 140,
    height: 140,
    backgroundColor: '#ffffff',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 2,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    zIndex: 0,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingSection: {
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bottomBranding: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;