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
    Dimensions,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';

const { width, height } = Dimensions.get('window');

interface ForgotPasswordScreenProps {
    onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateToLogin }) => {
    const { resetPassword, theme, colorScheme, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme, colorScheme), [theme, colorScheme]);
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleReset = () => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setIsLoading(true);
        setTimeout(() => {
            void (async () => {
                const result = await resetPassword(email.trim());
                setIsLoading(false);
                if (result.success) {
                    setSuccessMsg(t('recoverySent', { email: email.trim() }) || 'Recovery email sent');
                    setIsSubmitted(true);
                } else {
                    setErrorMsg(result.error || t('genericError') || 'Something went wrong');
                    shake();
                }
            })();
        }, 800);
    };

    const isDark = colorScheme === 'dark';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            {/* Background Image */}
            <Image
                source={
                    isDark
                        ? require('../../assets/login-bg-dark.png')
                        : require('../../assets/logi-bg-light.png')
                }
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Back Button */}
                <TouchableOpacity onPress={onNavigateToLogin} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#0A66FF'} />
                </TouchableOpacity>

                {/* Logo */}
                <View style={styles.logoSection}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Screen Title */}
                <Text style={styles.screenTitle}>{t('forgotPasswordTitle') || 'Forgot Password'}</Text>
                <Text style={styles.screenSubtitle}>
                    {t('recoverySubtitle') || 'Enter your email to recover your account'}
                </Text>

                {/* Error Banner */}
                {errorMsg && (
                    <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
                        <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </Animated.View>
                )}

                {/* Success Banner */}
                {successMsg && !isSubmitted && (
                    <View style={[styles.errorBox, { borderColor: 'rgba(34,197,94,0.25)', backgroundColor: 'rgba(34,197,94,0.08)' }]}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
                        <Text style={[styles.errorText, { color: theme.success }]}>{successMsg}</Text>
                    </View>
                )}

                {/* Form Card */}
                <View style={styles.cardContainer}>
                    {!isSubmitted ? (
                        <>
                            {/* Email Address */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>{t('emailAddress') || 'Email Address'}</Text>
                                <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color={emailFocused ? '#0A66FF' : (isDark ? '#0A66FF' : '#0A66FF')}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('enterRegisteredEmail') || 'Enter registered email'}
                                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
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

                            {/* CTA Button */}
                            <TouchableOpacity
                                style={styles.ctaBtn}
                                onPress={handleReset}
                                activeOpacity={0.9}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={['#0A66FF', '#0A66FF', '#FF6B00']}
                                    locations={[0, 0.4, 1]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaBtnGradient}
                                >
                                    {isLoading ? (
                                        <Text style={styles.ctaBtnText}>{t('sendingLink') || 'Sending Link...'}</Text>
                                    ) : (
                                        <>
                                            <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                                            <Text style={styles.ctaBtnText}>{t('sendRecoveryLink') || 'Send Recovery Link'}</Text>
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
                                    <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.submittedTitle}>{t('checkYourEmail') || 'Check Your Email'}</Text>
                            <Text style={styles.submittedSubtitle}>
                                {t('recoverySubtitle') || 'We have sent password recovery instructions to your email.'}
                            </Text>
                            <TouchableOpacity
                                style={styles.resendBtn}
                                onPress={() => { setIsSubmitted(false); setSuccessMsg(null); }}
                            >
                                <Text style={styles.resendText}>{t('resendEmail') || 'Resend Email'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Tips Card */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>{t('tipsTitle') || 'Tips'}</Text>
                    <Text style={styles.tipsText}>• {t('tipSpam') || 'Check spam folder'}</Text>
                    <Text style={styles.tipsText}>• {t('tipExpires') || 'Link expires in 24 hours'}</Text>
                    <Text style={styles.tipsText}>• {t('tipSupport') || 'Contact support if you need help'}</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createStyles = (theme: AppTheme, colorScheme: 'light' | 'dark') => {
    const isDark = colorScheme === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#081220' : '#F7FAFF',
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 70 : 50,
            paddingBottom: 40,
        },
        backgroundImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
        },
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            marginBottom: 20,
        },
        logoSection: {
            alignItems: 'center',
        },
        logo: {
            width: 250,
            height: 120,
        },
        screenTitle: {
            fontSize: 32,
            fontWeight: '700',
            color: isDark ? '#FFFFFF' : '#0B1F4D',
            textAlign: 'center',
            marginBottom: 6,
            letterSpacing: -0.5,
        },
        screenSubtitle: {
            fontSize: 14,
            fontWeight: '500',
            color: isDark ? '#94A3B8' : '#64748B',
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 20,
            paddingHorizontal: 16,
        },
        errorBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.2)',
            gap: 12,
            marginHorizontal: 16,
        },
        errorText: {
            fontSize: 13,
            color: theme.error,
            fontWeight: '500',
            flex: 1,
        },
        cardContainer: {
            backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.65)',
            padding: 24,
            marginBottom: 20,
            marginHorizontal: 4,
        },
        fieldGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#F8FAFC' : '#1E293B',
            marginBottom: 8,
        },
        inputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            paddingHorizontal: 16,
            height: 52,
            gap: 12,
        },
        inputWrapFocused: {
            borderColor: '#0A66FF',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF',
        },
        input: {
            flex: 1,
            fontSize: 15,
            color: isDark ? '#FFFFFF' : '#0F172A',
            fontWeight: '400',
            padding: 0,
        },
        ctaBtn: {
            borderRadius: 14,
            overflow: 'hidden',
            height: 52,
            // iOS shadow
            shadowColor: '#0A66FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 4,
            marginTop: 8,
        },
        ctaBtnGradient: {
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        },
        ctaBtnText: {
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: 0.5,
        },
        submittedState: {
            alignItems: 'center',
            paddingVertical: 12,
        },
        successIconWrapper: {
            marginBottom: 20,
        },
        successIcon: {
            width: 72,
            height: 72,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        submittedTitle: {
            fontSize: 22,
            fontWeight: '800',
            color: isDark ? '#FFFFFF' : '#0B1F4D',
            marginBottom: 10,
        },
        submittedSubtitle: {
            fontSize: 14,
            color: isDark ? '#94A3B8' : '#64748B',
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 24,
        },
        resendBtn: {
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: '#0A66FF',
        },
        resendText: {
            fontSize: 14,
            color: '#0A66FF',
            fontWeight: '700',
        },
        tipsCard: {
            backgroundColor: isDark ? 'rgba(10, 22, 40, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            borderRadius: 24,
            padding: 20,
            marginBottom: 24,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
        },
        tipsTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: '#0A66FF',
            marginBottom: 10,
        },
        tipsText: {
            fontSize: 13,
            color: isDark ? '#94A3B8' : '#64748B',
            fontWeight: '500',
            lineHeight: 22,
        },
    });
};
