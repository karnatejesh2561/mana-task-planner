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

// Brand colors extracted from Mana Task Planner logo
const BRAND = {
  navy: '#0B1F4D',
  blue: '#008DFF',
  blueDeep: '#1565C0',
  orange: '#FF6B00',
  red: '#FF3D3D',
  bgBlue: '#EBF4FF',
  bgOrange: '#FFF3EB',
  inputBg: '#FFFFFF',
  inputBorder: '#E8EDF5',
  inputFocusBorder: '#008DFF',
  textDark: '#0B1F4D',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register, theme, colorScheme, t } = useApp();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = () => {
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      const result = register(name, email.trim(), password, confirmPassword);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || t('genericError'));
        shake();
      }
    }, 600);
  };

  const getStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 4) return { bars: 1, label: t('weak'), color: theme.error };
    if (password.length < 8) return { bars: 2, label: t('fair'), color: theme.warning };
    return { bars: 3, label: t('strong'), color: theme.success };
  };

  const strength = getStrength();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

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
        {/* ── Top Row: Back ── */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onNavigateToLogin}>
            <Ionicons name="chevron-back" size={22} color={theme.navy} />
          </TouchableOpacity>
        </View>

        {/* ── Logo ── */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ── Screen Title ── */}
        <Text style={styles.screenTitle}>{t('createAccount')}</Text>

        {/* ── Error ── */}
        {errorMsg && (
          <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
            <Ionicons name="alert-circle-outline" size={15} color={theme.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </Animated.View>
        )}

        {/* ── Form ── */}
        <View style={styles.form}>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('fullName')}</Text>
            <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
              <TextInput
                style={styles.input}
                placeholder={t('enterName')}
                placeholderTextColor={theme.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>

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

            {/* Strength bars */}
            {strength && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: strength.bars >= i ? strength.color : theme.divider },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('confirmPassword')}</Text>
            <View style={[
              styles.inputWrap,
              confirmFocused && styles.inputWrapFocused,
              confirmPassword.length > 0 && {
                borderColor: passwordsMatch
                  ? 'rgba(34,197,94,0.6)'
                  : 'rgba(239,68,68,0.6)',
              },
            ]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t('repeatPassword')}
                placeholderTextColor={theme.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textLight}
                />
              </TouchableOpacity>
              {confirmPassword.length > 0 && (
                <Ionicons
                  name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={passwordsMatch ? theme.success : theme.error}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>

          {/* Terms checkbox row */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(v => !v)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={12} color={theme.textInverted} />
              )}
            </View>
            <Text style={styles.termsText}>
              {t('termsPrefix')}
              <Text style={styles.termsLink}>{t('personalData')}</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up button */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleRegister}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[theme.blue, theme.blueDeep]}
              style={styles.ctaBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaBtnText}>
                {isLoading ? t('creating') : t('signUp')}
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

        {/* ── Bottom link ── */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>{t('alreadyHaveAccount')}</Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.bottomLink}>{t('logIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bgBlue },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 40,
  },

  // Top row
  topRow: {
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    shadowRadius: 10,
    elevation: 2,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.55,
    height: 50,
    objectFit: 'cover',
  },

  // Title
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textDark,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.1,
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

  form: {},

  fieldGroup: {
    marginBottom: 16,
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

  // Strength
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    width: 38,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.blue,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: theme.blue,
    borderColor: theme.blue,
  },
  termsText: {
    fontSize: 13,
    color: theme.textGray,
    flex: 1,
  },
  termsLink: {
    color: theme.blue,
    fontWeight: '600',
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

