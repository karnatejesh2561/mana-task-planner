import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';

const { width } = Dimensions.get('window');

// Brand colors extracted from logo
const BRAND = {
  navy: '#0B1F4D',
  blue: '#008DFF',
  blueDeep: '#1565C0',
  orange: '#FF6B00',
  red: '#FF3D3D',
  // Soft brand tints for background
  bgBlue: '#EBF4FF',    // very light blue tint (top)
  bgOrange: '#FFF3EB',  // very light orange tint (bottom)
  // Inputs
  inputBg: '#FFFFFF',
  inputBorder: '#E8EDF5',
  inputFocusBorder: '#008DFF',
  // Text
  textDark: '#0B1F4D',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  // Status
  error: '#EF4444',
  success: '#22C55E',
};

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToForgot,
}) => {
  const { login, theme, colorScheme, t } = useApp();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      void (async () => {
        const result = await login(email.trim(), password);
        setIsLoading(false);
        if (!result.success) {
          setErrorMsg(result.error || t('genericError'));
          shake();
        }
      })();
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.bgBlue} />

      {/* Soft brand gradient background */}
      <LinearGradient
        colors={[theme.bgBlue, theme.background, theme.backgroundAlt]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Logo ── */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ── Screen Title ── */}
        <Text style={styles.screenTitle}>{t('loginTitle')}</Text>

        {/* ── Error ── */}
        {errorMsg && (
          <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
            <Ionicons name="alert-circle-outline" size={15} color={theme.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </Animated.View>
        )}

        {/* ── Form ── */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('emailAddress')}</Text>
            <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
              <TextInput
                style={styles.input}
                placeholder={t('enterEmail')}
                placeholderTextColor={theme.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('password')}</Text>
            <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t('password')}
                placeholderTextColor={theme.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password */}
          <TouchableOpacity onPress={onNavigateToForgot} style={styles.forgotRow}>
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          {/* Log In button */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleLogin}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[theme.blue, theme.blueDeep]}
              style={styles.ctaBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaBtnText}>
                {isLoading ? t('loggingIn') : t('logIn')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>{t('orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialPill} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={styles.socialPillText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCircle} activeOpacity={0.8}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCircle} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={20} color={theme.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCircle} activeOpacity={0.8}>
              <Ionicons name="logo-twitter" size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Demo hint ── */}
        <View style={styles.demoRow}>
          <Ionicons name="information-circle-outline" size={14} color={theme.blue} />
          <Text style={styles.demoText}>  {t('demoLogin')}</Text>
        </View>

        {/* ── Bottom link ── */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>{t('doYouHaveAccount')}</Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.bottomLink}>{t('register')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bgBlue },
  gradient: {
    ...StyleSheet.absoluteFill,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.55,
    height: 70,
    objectFit: 'cover',
  },

  // Title
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.textDark,
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.2,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: theme.error,
    fontWeight: '500',
    flex: 1,
  },

  // Form
  form: {},

  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textDark,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.inputBorder,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapFocused: {
    borderColor: theme.blue,
    shadowColor: theme.blue,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.textDark,
    fontWeight: '400',
  },
  eyeBtn: { padding: 4 },

  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    color: theme.blue,
    fontWeight: '500',
  },

  // CTA
  ctaBtn: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: theme.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaBtnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.textInverted,
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.divider,
  },
  dividerLabel: {
    fontSize: 13,
    color: theme.textGray,
    fontWeight: '400',
    marginHorizontal: 14,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 8,
    borderWidth: 1.5,
    borderColor: theme.border,
    shadowRadius: 6,
    elevation: 2,
  },
  socialPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textDark,
  },
  socialCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    shadowRadius: 6,
    elevation: 2,
  },

  // Demo
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  demoText: {
    fontSize: 12,
    color: theme.blue,
    fontWeight: '400',
  },

  // Bottom link
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: theme.textGray,
    fontWeight: '400',
  },
  bottomLink: {
    fontSize: 14,
    color: theme.blue,
    fontWeight: '700',
  },
});

