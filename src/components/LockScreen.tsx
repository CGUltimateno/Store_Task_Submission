import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  const gradientColors = theme.mode === 'dark' 
    ? ['rgba(15, 23, 42, 0.98)', 'rgba(10, 14, 26, 0.98)', 'rgba(15, 23, 42, 0.98)']
    : ['rgba(255, 255, 255, 0.98)', 'rgba(250, 251, 252, 0.98)', 'rgba(245, 247, 250, 0.98)'];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons 
            name="lock-closed" 
            size={48} 
            color={theme.colors.accent} 
          />
        </Animated.View>

        <Text style={[styles.title, { color: theme.colors.primaryText }]}>
          App Locked
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          Your session has been locked for security
        </Text>

        <View style={[styles.infoBox, { 
          backgroundColor: theme.mode === 'dark' 
            ? 'rgba(129, 140, 248, 0.1)' 
            : 'rgba(99, 102, 241, 0.05)',
          borderColor: theme.mode === 'dark'
            ? 'rgba(129, 140, 248, 0.2)'
            : 'rgba(99, 102, 241, 0.15)',
        }]}>
          <Ionicons 
            name="information-circle" 
            size={20} 
            color={theme.colors.accent} 
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: theme.colors.tertiaryText }]}>
            Unlock to continue using the app
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { 
              backgroundColor: theme.colors.accent,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={onUnlock}
        >
          <Ionicons 
            name="lock-open" 
            size={22} 
            color={theme.colors.accentContrast} 
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: theme.colors.accentContrast }]}>
            Unlock App
          </Text>
        </Pressable>

        <View style={styles.decorativeContainer}>
          <View style={[styles.decorativeDot, { backgroundColor: theme.colors.accent, opacity: 0.3 }]} />
          <View style={[styles.decorativeDot, { backgroundColor: theme.colors.accentSecondary, opacity: 0.3 }]} />
          <View style={[styles.decorativeDot, { backgroundColor: theme.colors.accent, opacity: 0.3 }]} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.bottomHint, { opacity: fadeAnim }]}>
        <Ionicons 
          name="shield-checkmark" 
          size={16} 
          color={theme.colors.muted} 
          style={styles.shieldIcon}
        />
        <Text style={[styles.hintText, { color: theme.colors.muted }]}>
          Your data is protected
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    width: '100%',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  decorativeContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 8,
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomHint: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    marginRight: 6,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default LockScreen;
