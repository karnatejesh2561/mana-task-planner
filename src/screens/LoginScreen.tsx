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

interface LoginScreenProps {
    onNavigateToRegister: () => void;
    onNavigateToForgot: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
    onNavigateToRegister,
    onNavigateToForgot,
}) => {
    const { login, theme, colorScheme, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme, colorScheme), [theme, colorScheme]);
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
                    setErrorMsg(result.error || t('genericError') || 'Login failed');
                    shake();
                }
            })();
        }, 600);
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
                {/* Logo */}
                <View style={styles.logoSection}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Screen Title */}
                <Text style={styles.screenTitle}>Welcome Back</Text>
                <Text style={styles.screenSubtitle}>{t('Login to continue to ManaTask') || 'Login to continue to ManaTask'}</Text>

                {/* Error Message */}
                {errorMsg && (
                    <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
                        <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </Animated.View>
                )}

                {/* Glassmorphic Card Form */}
                <View style={styles.cardContainer}>
                    {/* Email Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('email') || 'Email'}</Text>
                        <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={emailFocused ? '#0A66FF' : (isDark ? '#0A66FF' : '#0A66FF')}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterEmail') || 'Enter your email'}
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

                    {/* Password Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('password') || 'Password'}</Text>
                        <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={passwordFocused ? '#0A66FF' : (isDark ? '#0A66FF' : '#0A66FF')}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterPassword') || 'Enter your password'}
                                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
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
                                    color={isDark ? '#94A3B8' : '#64748B'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity onPress={onNavigateToForgot} style={styles.forgotRow}>
                        <Text style={styles.forgotText}>{t('forgotPassword') || 'Forgot Password?'}</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={handleLogin}
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
                                {isLoading ? (t('loggingIn') || 'Logging In...') : (t('logIn') || 'Login')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.bottomRow}>
                    <Text style={styles.bottomText}>
                        {t("Don't have an account?") || "Don't have an account? "}
                    </Text>
                    <TouchableOpacity onPress={onNavigateToRegister}>
                        <Text style={styles.bottomLink}>{t('createAccount') || 'Create Account'}</Text>
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
            backgroundColor: isDark ? '#081220' : '#F7FAFF',
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 70 : 80,
        },
        logoSection: {
            alignItems: 'center',
        },
        logo: {
            width: 250,
            height: 120,
        },
        screenTitle: {
            fontSize: 30,
            fontWeight: '700',
            color: isDark ? '#FFFFFF' : '#0B1F4D',
            textAlign: 'center',
            marginBottom: 6,
            letterSpacing: -0.5,
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
        screenSubtitle: {
            fontSize: 14,
            fontWeight: '500',
            color: isDark ? '#94A3B8' : '#64748B',
            textAlign: 'center',
            marginBottom: 24,
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
            marginBottom: 24,
            marginHorizontal: 4,
        },
        fieldGroup: {
            marginBottom: 16,
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
            minHeight: 44,
            color: isDark ? '#FFFFFF' : '#0F172A',
            fontSize: 17,
            fontWeight: '400',
            marginLeft: 16,
            paddingVertical: 0,
        },
        eyeBtn: {
            padding: 4,
            justifyContent: 'center',
            alignItems: 'center',
        },
        forgotRow: {
            alignSelf: 'flex-end',
            marginTop: 4,
            marginBottom: 20,
        },
        forgotText: {
            fontSize: 13,
            color: '#0A66FF',
            fontWeight: '600',
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
        },
        ctaBtnGradient: {
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
        },
        ctaBtnText: {
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: 0.5,
        },
        bottomRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginTop: 10,
        },
        bottomText: {
            fontSize: 13,
            color: isDark ? '#94A3B8' : '#64748B',
            fontWeight: '400',
        },
        bottomLink: {
            fontSize: 13,
            color: '#0A66FF',
            fontWeight: '700',
        },
    });
};