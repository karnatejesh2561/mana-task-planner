import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, Text, TextInput, ScrollView,
  TouchableOpacity, Image, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, useApp } from '../AppContext';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateToLogin }) => {
  const { resetPassword, theme, t } = useApp();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleReset = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      const result = resetPassword(email.trim());
      setIsLoading(false);
      if (result.success) {
        setSuccessMsg(t('recoverySent', { email: email.trim() }));
        setIsSubmitted(true);
      } else {
        setErrorMsg(result.error || t('genericError'));
        shake();
      }
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={onNavigateToLogin}>
              <Ionicons name="chevron-back" size={22} color={theme.deepNavy} />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.lockIconWrapper}>
              <LinearGradient
                colors={[theme.purpleAccent, theme.electricBlue]}
                style={styles.lockIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="lock-open-outline" size={28} color={theme.textInverted} />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>{t('forgotPasswordTitle')}</Text>
            <Text style={styles.heroSubtitle}>
              {t('forgotPasswordSubtitle')}
            </Text>
          </View>

          {/* Error Banner */}
          {errorMsg && (
            <Animated.View style={[styles.errorBanner, { transform: [{ translateX: shakeAnim }] }]}>
              <Ionicons name="alert-circle" size={18} color={theme.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </Animated.View>
          )}

          {/* Success Banner */}
          {successMsg && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={theme.success} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {!isSubmitted ? (
              <>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>{t('emailAddress')}</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="mail-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('enterRegisteredEmail')}
                      placeholderTextColor={theme.textLight}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.ctaWrapper} onPress={handleReset} activeOpacity={0.92}>
                  <LinearGradient
                    colors={[theme.orangeAccent, theme.pinkAccent]}
                    style={styles.ctaGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <Text style={styles.ctaText}>{t('sendingLink')}</Text>
                    ) : (
                      <>
                        <Ionicons name="paper-plane-outline" size={20} color={theme.textInverted} style={{ marginRight: 8 }} />
                        <Text style={styles.ctaText}>{t('sendRecoveryLink')}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              /* Post-submit state */
              <View style={styles.submittedState}>
                <View style={styles.successIconWrapper}>
                  <LinearGradient
                    colors={[theme.success, '#16A34A']}
                    style={styles.successIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="checkmark" size={32} color={theme.textInverted} />
                  </LinearGradient>
                </View>
                <Text style={styles.submittedTitle}>{t('checkYourEmail')}</Text>
                <Text style={styles.submittedSubtitle}>
                  {t('recoverySubtitle')}
                </Text>
                <TouchableOpacity style={styles.resendBtn} onPress={() => { setIsSubmitted(false); setSuccessMsg(null); }}>
                  <Text style={styles.resendText}>{t('resendEmail')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>{t('tipsTitle')}</Text>
            <Text style={styles.tipsText}>• {t('tipSpam')}</Text>
            <Text style={styles.tipsText}>• {t('tipExpires')}</Text>
            <Text style={styles.tipsText}>• {t('tipSupport')}</Text>
          </View>

          {/* Back to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{t('rememberPassword')}</Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.loginLink}>{t('signIn')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 200, height: 70 },
  heroSection: { alignItems: 'center', marginBottom: 28 },
  lockIconWrapper: { marginBottom: 16 },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.purpleAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.deepNavy,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: { fontSize: 13, color: theme.error, fontWeight: '600', marginLeft: 8, flex: 1 },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  successText: { fontSize: 13, color: theme.success, fontWeight: '600', marginLeft: 8, flex: 1, lineHeight: 18 },
  formCard: {
    backgroundColor: theme.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
    marginBottom: 20,
  },
  fieldContainer: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputMuted,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: theme.textPrimary, fontWeight: '500' },
  ctaWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: theme.orangeAccent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaGradient: {
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaText: { color: theme.textInverted, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  submittedState: { alignItems: 'center', paddingVertical: 12 },
  successIconWrapper: { marginBottom: 20 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  submittedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.textPrimary,
    marginBottom: 10,
  },
  submittedSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resendBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.electricBlue,
  },
  resendText: { fontSize: 14, color: theme.electricBlue, fontWeight: '700' },
  tipsCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: theme.purpleAccent, marginBottom: 10 },
  tipsText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500', lineHeight: 22 },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: { fontSize: 15, color: theme.textSecondary, fontWeight: '500' },
  loginLink: { fontSize: 15, color: theme.electricBlue, fontWeight: '800' },
});



