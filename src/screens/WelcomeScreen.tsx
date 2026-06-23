import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Image,
    Dimensions,
    Animated,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppTheme, useApp } from '../AppContext';

const { width, height } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = width * 0.75;

interface WelcomeScreenProps {
    onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const { theme, colorScheme } = useApp();
    const styles = React.useMemo(() => createStyles(theme, colorScheme), [theme, colorScheme]);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Scale and fade in logo/content
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Progress bar animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
        }).start(() => {
            setTimeout(onComplete, 1500);
        });
    }, [progressAnim, scaleAnim, opacityAnim, onComplete]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, PROGRESS_BAR_WIDTH],
    });

    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            {/* Background Image */}
            <Image
                source={
                    isDark
                        ? require('../../assets/background-dark.png')
                        : require('../../assets/background-light.png')
                }
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Content Container */}
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                {/* Logo */}
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

            </Animated.View>

            {/* Progress Bar Container */}
            <View style={styles.progressBarContainer}>
                {/* Track */}
                <View style={styles.progressTrack} />

                {/* Animated Fill */}
                <Animated.View
                    style={[
                        styles.progressFillContainer,
                        {
                            width: progressWidth,
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['#0A66FF', '#FF6B00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientFill}
                    />
                </Animated.View>

                {/* Glowing Dot */}
                <Animated.View
                    style={[
                        styles.glowingDot,
                        {
                            transform: [{ translateX: progressWidth }],
                        },
                    ]}
                >
                    {/* Shadow/Glow layer for Android & iOS */}
                    <View style={styles.glowOuter} />
                    <View style={styles.glowInner} />
                </Animated.View>
            </View>
        </View>
    );
};

const createStyles = (theme: AppTheme, colorScheme: 'light' | 'dark') => {
    const isDark = colorScheme === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        contentContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -height * 0.05, // slightly nudge up from center for better visual balance
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
        logo: {
            width: 300,
            height: 300,
        },
        appName: {
            fontSize: 42,
            fontWeight: '700',
            color: isDark ? '#FFFFFF' : '#0B1F4D',
            letterSpacing: -0.5,
            marginBottom: 10,
        },
        appNameBlue: {
            color: '#0A66FF',
        },
        tagline: {
            fontSize: 16,
            fontWeight: '500',
            color: isDark ? '#94A3B8' : '#64748B',
            letterSpacing: 0.5,
        },
        progressBarContainer: {
            position: 'absolute',
            bottom: height * 0.22, // matches the bottom third position
            width: PROGRESS_BAR_WIDTH,
            height: 4,
            justifyContent: 'center',
        },
        progressTrack: {
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2.5,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderRadius: 2,
        },
        progressFillContainer: {
            position: 'absolute',
            left: 0,
            height: 3.5,
            borderRadius: 2,
            overflow: 'hidden',
        },
        gradientFill: {
            width: PROGRESS_BAR_WIDTH,
            height: '100%',
        },
        glowingDot: {
            position: 'absolute',
            left: -6, // offset by half the dot's size to align center
            width: 12,
            height: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        glowOuter: {
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: 'rgba(255, 107, 0, 0.45)', // orange glow
            top: -4,
            left: -4,
        },
        glowInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            borderColor: '#FF6B00',
            // iOS native shadow
            shadowColor: '#FF6B00',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 5,
        },
    });
};

