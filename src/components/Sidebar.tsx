import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useApp } from '../AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 300);

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
    activeTab: string;
    onNavigate: (screen: string) => void;
    onLogout: () => void;
}

const NAV_ITEMS = [
    { key: 'Home', icon: 'home-outline', label: 'home', color: '#0A66FF' },
    { key: 'Calendar', icon: 'calendar-outline', label: 'calendar', color: '#0A66FF' },
    { key: 'Notifications', icon: 'notifications-outline', label: 'notifications', color: '#0A66FF' },
    { key: 'Settings', icon: 'settings-outline', label: 'settings', color: '#0A66FF' },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
    visible,
    onClose,
    activeTab,
    onNavigate,
    onLogout,
}) => {
    const { theme, colorScheme, t } = useApp();
    const isDark = colorScheme === 'dark';

    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        if (visible) {
            setMounted(true);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 180,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -SIDEBAR_WIDTH,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start(() => setMounted(false));
        }
    }, [visible]);

    if (!mounted) return null;



    const cardBg = isDark ? '#0F1D2E' : '#FFFFFF';
    const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Dim overlay */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[
                        styles.overlay,
                        { opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                    ]}
                />
            </TouchableWithoutFeedback>

            {/* Sidebar panel */}
            <Animated.View
                style={[
                    styles.panel,
                    {
                        width: SIDEBAR_WIDTH,
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <LinearGradient
                    colors={isDark ? ['#081220', '#0D1825', '#132438'] : ['#F7FAFF', '#FFFFFF', '#EEF3FF']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                {!isDark && (
                    <Image
                        source={require('../../assets/background-image.png')}
                        resizeMode="cover"
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.18 }}
                    />
                )}

                {/* Header with Logo and Close button */}
                <View style={[styles.sidebarHeader, { borderBottomColor: divider }]}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={[
                            styles.closeBtn,
                            {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Nav items */}
                <View style={styles.navList}>
                    {NAV_ITEMS.map(item => {
                        const isActive = activeTab === item.key;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                style={[
                                    styles.navItem,
                                    isActive && {
                                        backgroundColor: isDark ? 'rgba(10,102,255,0.14)' : 'rgba(10,102,255,0.08)',
                                        borderColor: isDark ? 'rgba(10,102,255,0.30)' : 'rgba(10,102,255,0.20)',
                                    },
                                    !isActive && { borderColor: 'transparent', backgroundColor: 'transparent' },
                                ]}
                                activeOpacity={0.80}
                                onPress={() => { onNavigate(item.key); onClose(); }}
                            >
                                {/* Active left bar */}
                                {isActive && <View style={[styles.activeBar, { backgroundColor: item.color }]} />}

                                <View style={[
                                    styles.navIconBox,
                                    {
                                        backgroundColor: isActive
                                            ? isDark ? `${item.color}28` : `${item.color}16`
                                            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    },
                                ]}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={20}
                                        color={isActive ? item.color : (isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF')}
                                    />
                                </View>
                                <Text style={[
                                    styles.navLabel,
                                    { color: isActive ? item.color : theme.text },
                                    isActive && { fontWeight: '700' },
                                ]}>
                                    {t(item.label)}
                                </Text>
                                {isActive && (
                                    <View style={styles.navChevron}>
                                        <Ionicons name="chevron-forward" size={14} color={item.color} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: divider }]} />

                {/* Logout */}
                <TouchableOpacity
                    style={[
                        styles.logoutBtn,
                        {
                            backgroundColor: isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.07)',
                            borderColor: isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.18)',
                        },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => { onLogout(); onClose(); }}
                >
                    <View style={[styles.navIconBox, { backgroundColor: isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.10)' }]}>
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    </View>
                    <Text style={[styles.navLabel, { color: '#EF4444', fontWeight: '700' }]}>{t('signOut')}</Text>
                </TouchableOpacity>

                {/* App version */}
                <Text style={[styles.version, { color: theme.textSecondary }]}>Mana Task Planner v1.0</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.52)',
    },
    panel: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 24,
    },
    sidebarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 25,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: 16,
    },
    logo: {
        width: 108,
        height: 34,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Nav
    navList: {
        paddingHorizontal: 14,
        gap: 4,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    activeBar: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 4,
        borderRadius: 2,
    },
    navIconBox: {
        width: 40,
        height: 40,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    navLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    navChevron: {
        marginLeft: 4,
    },

    // Divider
    divider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 20,
        marginVertical: 14,
    },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
    },

    version: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 38 : 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '400',
    },
});
