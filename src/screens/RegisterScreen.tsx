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

const { width, height } = Dimensions.get('window');

interface RegisterScreenProps {
    onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
    const { register, theme, colorScheme, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme, colorScheme), [theme, colorScheme]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
        setSuccessMsg(null);
        if (!agreedToTerms) {
            setErrorMsg(t('termsRequired'));
            shake();
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            void (async () => {
                const result = await register(name, email.trim(), password, confirmPassword);
                setIsLoading(false);
                if (!result.success) {
                    setErrorMsg(result.error || t('genericError'));
                    shake();
                    return;
                }

                if (result.requiresEmailConfirmation) {
                    setSuccessMsg(t('verifyEmailToContinue'));
                    setTimeout(onNavigateToLogin, 1200);
                }
            })();
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

    const isDark = colorScheme === 'dark';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

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
                    <Ionicons name="chevron-back" size={24} color={theme.blue} />
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
                <Text style={styles.screenTitle}>{t('createAccount')}</Text>
                <Text style={styles.screenSubtitle}>{t('joinManaTask')}</Text>

                {/* Error Message */}
                {errorMsg && (
                    <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
                        <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </Animated.View>
                )}

                {/* Success Message */}
                {successMsg && (
                    <View style={[styles.errorBox, { borderColor: 'rgba(34,197,94,0.25)', backgroundColor: 'rgba(34,197,94,0.08)' }]}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
                        <Text style={[styles.errorText, { color: theme.success }]}>{successMsg}</Text>
                    </View>
                )}

                {/* Form */}
                <View style={styles.cardContainer}>
                    {/* Full Name Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('fullName') || 'Full Name'}</Text>
                        <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                color={nameFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterName') || 'Enter your full name'}
                                placeholderTextColor={theme.textGray}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                onFocus={() => setNameFocused(true)}
                                onBlur={() => setNameFocused(false)}
                            />
                        </View>
                    </View>

                    {/* Email Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={emailFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterEmail') || 'Enter your email'}
                                placeholderTextColor={theme.textGray}
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

                    {/* Password Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('password')}</Text>
                        <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={passwordFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder={t('enterPassword') || 'Enter your password'}
                                placeholderTextColor={theme.textGray}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={theme.textGray}
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
                                            { backgroundColor: strength.bars >= i ? strength.color : theme.border },
                                        ]}
                                    />
                                ))}
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                    {strength.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Confirm Password Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('confirmPassword')}</Text>
                        <View
                            style={[
                                styles.inputWrap,
                                confirmFocused && styles.inputWrapFocused,
                                confirmPassword.length > 0 && {
                                    borderColor: passwordsMatch ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                                },
                            ]}
                        >
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={20}
                                color={confirmFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder={t('confirmPassword') || 'Repeat password'}
                                placeholderTextColor={theme.textGray}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                onFocus={() => setConfirmFocused(true)}
                                onBlur={() => setConfirmFocused(false)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={theme.textGray}
                                />
                            </TouchableOpacity>
                            {confirmPassword.length > 0 && (
                                <Ionicons
                                    name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                                    size={18}
                                    color={passwordsMatch ? theme.success : theme.error}
                                />
                            )}
                        </View>
                    </View>

                    {/* Terms & Conditions Checkbox */}
                    <TouchableOpacity
                        style={styles.termsRow}
                        onPress={() => setAgreedToTerms(!agreedToTerms)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                            {agreedToTerms && (
                                <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                            )}
                        </View>
                        <Text style={styles.termsText}>
                            {t('termsPrefix') || 'I agree to the '}
                            <Text style={styles.termsLink}>{t('termsAndConditions') || 'Terms & Conditions'}</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Create Account Button */}
                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={handleRegister}
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
                            <Text style={styles.ctaBtnText}>
                                {isLoading ? t('creating') : t('createAccount')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Login Link */}
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

const createStyles = (theme: AppTheme, colorScheme: 'light' | 'dark') => {
    const isDark = colorScheme === 'dark';
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
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
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 48,
            paddingBottom: 40,
        },

        // Back Button
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 16,
        },

        // Logo
        logoSection: {
            alignItems: 'center',
        },
        logo: {
            width: 250,
            height: 100,
        },

        // Title & Subtitle
        screenTitle: {
            fontSize: 30,
            fontWeight: '700',
            color: isDark ? '#FFFFFF' : '#0B1F4D',
            textAlign: 'center',
            marginBottom: 6,
            letterSpacing: -0.5,
        },
        screenSubtitle: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textGray,
            textAlign: 'center',
            marginBottom: 24,
        },

        // Error/Success
        errorBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.2)',
            gap: 12,
        },
        errorText: {
            fontSize: 13,
            color: theme.error,
            fontWeight: '500',
            flex: 1,
        },

        // Form
        cardContainer: {
            backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.65)',
            padding: 24,
            marginBottom: 24,
            marginHorizontal: 4,
        },

        fieldGroup: {
            marginBottom: 14,
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.textDark,
            marginBottom: 8,
            textTransform: 'capitalize',
        },
        inputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surface,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: theme.border,
            paddingHorizontal: 16,
            height: 52,
            gap: 12,
        },
        inputWrapFocused: {
            borderColor: theme.blue,
            backgroundColor: theme.background,
            borderWidth: 2,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: theme.textDark,
            fontWeight: '400',
            padding: 0,
        },
        eyeBtn: {
            padding: 4,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // Strength bars
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
            marginLeft: 6,
            width: 40,
        },

        // Terms Checkbox
        termsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
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

        // CTA Button
        ctaBtn: {
            borderRadius: 14,
            overflow: 'hidden',
            height: 56,
            shadowColor: '#0A66FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
        },
        ctaBtnGradient: {
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
        },
        ctaBtnText: {
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: 0.5,
        },

        // Bottom Link
        bottomRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
        },
        bottomText: {
            fontSize: 13,
            color: theme.textGray,
            fontWeight: '400',
        },
        bottomLink: {
            fontSize: 13,
            color: theme.blue,
            fontWeight: '700',
        },
    });
};

