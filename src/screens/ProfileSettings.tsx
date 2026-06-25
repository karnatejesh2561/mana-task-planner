import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { LANGUAGE_LABELS } from '../i18n';
import { NotificationSettings } from './NotificationSettings';
import { DefaultReminder } from './DefaultReminder';
import { PrivacyPolicy } from './PrivacyPolicy';
import { glassButton, glassInput, glassSurface, glowShadow } from '../theme/glass';

interface ProfileSettingsProps {
    onNavigate: (screen: string) => void;
    onLogout?: () => void;
}

type ProfileMode = 'settings' | 'details' | 'edit' | 'notifications' | 'defaultReminder' | 'privacy';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=240&h=240&fit=crop&q=90';
const MAX_ABOUT = 120;

// ─── Icon Circle Component ────────────────────────────────────────────────────
const IconCircle: React.FC<{
    name: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
}> = ({ name, color, bgColor }) => (
    <View style={[iconCircleStyles.circle, { backgroundColor: bgColor }]}>
        <Ionicons name={name} size={22} color={color} />
    </View>
);

const iconCircleStyles = StyleSheet.create({
    circle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// ─── Setting Row Card ─────────────────────────────────────────────────────────
interface SettingRowCardProps {
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    theme: AppTheme;
    isDestructive?: boolean;
}

const SettingRowCard: React.FC<SettingRowCardProps> = ({
    iconName,
    iconColor,
    iconBg,
    title,
    subtitle,
    onPress,
    theme,
    isDestructive,
}) => {
    const isDark = theme.scheme === 'dark';
    const cardBg = isDestructive
        ? isDark ? 'rgba(255,80,50,0.10)' : 'rgba(255,240,235,1)'
        : isDark ? '#0F1D2E' : '#FFFFFF';
    const cardBorder = isDestructive
        ? isDark ? 'rgba(255,80,50,0.18)' : 'rgba(255,180,150,0.4)'
        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            style={[
                rowCardStyles.card,
                {
                    backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
                    borderColor: cardBorder,
                    shadowColor: isDark ? '#000' : '#0A66FF',
                    shadowOpacity: isDark ? 0.18 : 0.05,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 2 },
                },
            ]}
        >
            <IconCircle name={iconName} color={iconColor} bgColor={iconBg} />
            <View style={rowCardStyles.textBlock}>
                <Text style={[rowCardStyles.title, { color: isDestructive ? '#FF5A32' : theme.text }]}>
                    {title}
                </Text>
                <Text style={[rowCardStyles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={18}
                color={isDestructive ? '#FF5A32' : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            />
        </TouchableOpacity>
    );
};

const rowCardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    textBlock: {
        flex: 1,
        marginLeft: 14,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
    },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onNavigate, onLogout }) => {
    const { user, theme, colorScheme, toggleTheme, language, toggleLanguage, updateProfile, t, notificationBellCount } = useApp();
    const onBellPress = () => onNavigate('Notifications');
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [mode, setMode] = useState<ProfileMode>('settings');
    const [reminderSource, setReminderSource] = useState<'settings' | 'notifications'>('settings');
    const [name, setName] = useState(user?.name || 'Hemanth Reddy');
    const [email, setEmail] = useState(user?.email || 'hemanthreddy@email.com');
    const [password, setPassword] = useState('');
    const [about, setAbout] = useState(user?.about || 'Building products that make life simple and productive.');
    const [photoUri, setPhotoUri] = useState(user?.photoUri || DEFAULT_AVATAR);

    const isDark = colorScheme === 'dark';

    useEffect(() => {
        setName(user?.name || 'Hemanth Reddy');
        setEmail(user?.email || 'hemanthreddy@email.com');
        setPassword('');
        setAbout(user?.about || 'Building products that make life simple and productive.');
        setPhotoUri(user?.photoUri || DEFAULT_AVATAR);
    }, [user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.9,
        });
        if (!result.didCancel && result.assets && result.assets[0]?.uri) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const saveProfile = async () => {
        const result = await updateProfile({ name, email, about, password: password.trim() || undefined, photoUri });
        if (!result.success) {
            Alert.alert(t('updateProfile'), result.error || t('comingSoon', { title: t('updateProfile') }));
            return;
        }
        setPassword('');
        setMode('details');
    };

    // ─── Sub-screens ──────────────────────────────────────────────────────────
    if (mode === 'notifications') {
        return (
            <NotificationSettings
                onBack={() => setMode('settings')}
                onNavigateToDefaultReminder={() => {
                    setReminderSource('notifications');
                    setMode('defaultReminder');
                }}
            />
        );
    }

    if (mode === 'privacy') {
        return <PrivacyPolicy onBack={() => setMode('settings')} />;
    }

    if (mode === 'defaultReminder') {
        return <DefaultReminder onBack={() => setMode(reminderSource)} />;
    }

    if (mode === 'edit') {
        return (
            <View style={styles.screen}>
                {!isDark && (
                    <Image
                        source={require('../../assets/background-image.png')}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    />
                )}
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[
                            styles.backBtn,
                            {
                                backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                            },
                        ]}
                        onPress={() => setMode('details')}
                        activeOpacity={0.82}
                    >
                        <Ionicons name="chevron-back" size={22} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('editProfile')}</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            Update your account details
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.saveTopButton} onPress={() => void saveProfile()} activeOpacity={0.82}>
                        <Text style={styles.saveTopText}>{t('save')}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editContent}>
                    <TouchableOpacity style={styles.editAvatarWrap} onPress={pickImage} activeOpacity={0.85}>
                        <Image source={{ uri: photoUri }} style={styles.editAvatar} />
                        <View style={styles.cameraBadge}>
                            <Ionicons name="camera-outline" size={22} color={theme.blue} />
                        </View>
                    </TouchableOpacity>

                    <ProfileField label={t('fullName')} icon="person-outline" value={name} onChangeText={setName} styles={styles} theme={theme} />
                    <ProfileField label={t('email')} icon="mail-outline" value={email} onChangeText={setEmail} styles={styles} theme={theme} keyboardType="email-address" />
                    <ProfileField label={t('changePassword')} icon="lock-closed-outline" value={password} onChangeText={setPassword} styles={styles} theme={theme} secureTextEntry trailing />

                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>{t('aboutYou')}</Text>
                        <View style={styles.aboutBox}>
                            <TextInput
                                style={styles.aboutInput}
                                value={about}
                                onChangeText={text => setAbout(text.slice(0, MAX_ABOUT))}
                                placeholder={t('tellUsAboutYou')}
                                placeholderTextColor={theme.placeholder}
                                multiline
                                textAlignVertical="top"
                            />
                            <Text style={styles.counterText}>{about.length}/{MAX_ABOUT}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={() => void saveProfile()} activeOpacity={0.88}>
                        <LinearGradient
                            colors={['#0A66FF', '#0A66FF', '#FF6B00']}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryGradient}
                        >
                            <Text style={styles.primaryText}>{t('saveChanges')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    if (mode === 'details') {
        return (
            <View style={styles.screen}>
                {!isDark && (
                    <Image
                        source={require('../../assets/background-image.png')}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    />
                )}

                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[
                            styles.backBtn,
                            {
                                backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                            },
                        ]}
                        onPress={() => setMode('settings')}
                        activeOpacity={0.82}
                    >
                        <Ionicons name="chevron-back" size={22} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile Details</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            View your account details
                        </Text>
                    </View>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
                    <View style={styles.detailHero}>
                        <View>
                            <Image source={{ uri: photoUri }} style={styles.detailAvatar} />
                            <View style={styles.onlineDot} />
                        </View>
                        <Text style={styles.detailName}>{name}</Text>
                        <Text style={styles.detailEmail}>{email}</Text>
                        <View style={styles.joinedRow}>
                            <Ionicons name="calendar-outline" size={14} color={theme.blue} />
                            <Text style={styles.joinedText}>{t('joined', { date: user?.joinedAt || 'May 2024' })}</Text>
                        </View>
                    </View>

                    <View style={styles.infoStack}>
                        <InfoCard icon="person-outline" title={t('aboutYou')} value={about} styles={styles} theme={theme} />
                        <InfoCard icon="mail-outline" title={t('email')} value={email} styles={styles} theme={theme} />
                        <InfoCard icon="lock-closed-outline" title={t('password')} value="********" styles={styles} theme={theme} />
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={() => setMode('edit')} activeOpacity={0.88}>
                        <LinearGradient
                            colors={['#0A66FF', '#0A66FF', '#FF6B00']}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryGradient}
                        >
                            <Ionicons name="pencil-outline" size={21} color={theme.textInverted} />
                            <Text style={styles.primaryText}>{t('editProfile')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    // ─── MAIN SETTINGS VIEW ───────────────────────────────────────────────────
    const screenBg = isDark ? '#081220' : '#F0F4FF';

    return (
        <View style={[styles.screen, { backgroundColor: screenBg }]}>
            {/* Light mode soft background image */}
            {!isDark && (
                <Image
                    source={require('../../assets/background-image.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
            )}

            {/* ── Header ── */}
            <View style={[styles.pageHeader, { backgroundColor: 'transparent' }]}>
                <View>
                    <Text style={[styles.pageTitle, { color: theme.text }]}>Settings</Text>
                    <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>Manage your preferences</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.iconButton,
                        {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                        },
                    ]}
                    activeOpacity={0.75}
                    onPress={onBellPress}
                >
                    <Ionicons name="notifications-outline" size={22} color={theme.text} />
                    {notificationBellCount > 0 && (
                        <View style={styles.bellBadge}>
                            <Text style={styles.bellBadgeText}>
                                {notificationBellCount > 9 ? '9+' : notificationBellCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.settingsContent}
            >
                {/* ── Profile Card ── */}
                <TouchableOpacity
                    style={[
                        styles.profileCard,
                        {
                            backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
                            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                            shadowColor: isDark ? '#000' : '#0A66FF',
                            shadowOpacity: isDark ? 0.25 : 0.08,
                        },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setMode('details')}
                >
                    <Image source={{ uri: photoUri }} style={styles.profileAvatar} />
                    <View style={styles.profileCopy}>
                        <Text style={[styles.profileName, { color: theme.text }]}>{name}</Text>
                        <Text style={[styles.profileEmail, { color: theme.textSecondary }]} numberOfLines={1}>{email}</Text>
                        <View style={styles.premiumBadge}>
                            <Ionicons name="shield-checkmark" size={13} color="#0A66FF" />
                            <Text style={styles.premiumText}>Premium User</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'} />
                </TouchableOpacity>

                {/* ── Individual Setting Rows ── */}
                <SettingRowCard
                    iconName="notifications-outline"
                    iconColor="#0A66FF"
                    iconBg={isDark ? 'rgba(10,102,255,0.18)' : 'rgba(10,102,255,0.10)'}
                    title="Notifications"
                    subtitle="Manage your notification preferences"
                    onPress={() => setMode('notifications')}
                    theme={theme}
                />

                <SettingRowCard
                    iconName="time-outline"
                    iconColor="#FF6B00"
                    iconBg={isDark ? 'rgba(255,107,0,0.18)' : 'rgba(255,107,0,0.10)'}
                    title="Default Reminder"
                    subtitle="Set default reminder for tasks"
                    onPress={() => { setReminderSource('settings'); setMode('defaultReminder'); }}
                    theme={theme}
                />

                <SettingRowCard
                    iconName="color-palette-outline"
                    iconColor="#8B5CF6"
                    iconBg={isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.10)'}
                    title="Appearance"
                    subtitle="Customize app appearance"
                    onPress={toggleTheme}
                    theme={theme}
                />

                <SettingRowCard
                    iconName="globe-outline"
                    iconColor="#22C55E"
                    iconBg={isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.10)'}
                    title="Language"
                    subtitle="Choose your preferred language"
                    onPress={() => {
                        const nextLanguage = language === 'en' ? 'te' : 'en';
                        toggleLanguage();
                        Alert.alert(t('languageChangedTitle'), t('languageChangedMessage', { language: LANGUAGE_LABELS[nextLanguage] }));
                    }}
                    theme={theme}
                />

                <SettingRowCard
                    iconName="shield-outline"
                    iconColor="#8B5CF6"
                    iconBg={isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.10)'}
                    title={t('privacyPolicy')}
                    subtitle={t('privacyPolicySubtitle')}
                    onPress={() => setMode('privacy')}
                    theme={theme}
                />

                <SettingRowCard
                    iconName="log-out-outline"
                    iconColor="#FF5A32"
                    iconBg={isDark ? 'rgba(255,90,50,0.20)' : 'rgba(255,90,50,0.12)'}
                    title="Logout"
                    subtitle="Sign out from your account"
                    onPress={() => {
                        Alert.alert('Logout', 'Are you sure you want to sign out?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Logout', style: 'destructive', onPress: onLogout },
                        ]);
                    }}
                    theme={theme}
                    isDestructive
                />
            </ScrollView>
        </View>
    );
};

// ─── Sub-components (kept for sub-screens) ────────────────────────────────────
const InfoCard = ({
    icon,
    title,
    value,
    styles,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    styles: ReturnType<typeof createStyles>;
    theme: AppTheme;
}) => (
    <View style={styles.infoCard}>
        <View style={styles.infoIconBox}>
            <Ionicons name={icon} size={25} color={theme.blue} />
        </View>
        <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
        </View>
    </View>
);

const ProfileField = ({
    label,
    icon,
    value,
    onChangeText,
    styles,
    theme,
    secureTextEntry,
    keyboardType,
    trailing,
}: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChangeText: (value: string) => void;
    styles: ReturnType<typeof createStyles>;
    theme: AppTheme;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    trailing?: boolean;
}) => (
    <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.inputRow}>
            <Ionicons name={icon} size={23} color={theme.blue} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={label}
                placeholderTextColor={theme.placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            />
            {trailing && <Ionicons name="chevron-forward" size={20} color={theme.blue} />}
        </View>
    </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const createStyles = (theme: AppTheme) => StyleSheet.create({
    screen: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%', height: '100%',
        opacity: 0.35,
    },

    // ── Main Settings ──────────────────────────────────────────────────────
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingHorizontal: 22,
        paddingBottom: 8,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    pageSubtitle: {
        fontSize: 13,
        fontWeight: '400',
    },
    bellButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: 2,
    },
    bellDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#FF6B00',
        zIndex: 1,
    },
    settingsContent: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 120,
    },

    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FF6B00',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    bellBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    // ── Profile Card ───────────────────────────────────────────────────────
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 18,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,

    },
    profileAvatar: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: theme.avatarBg,
    },
    profileCopy: {
        flex: 1,
        marginLeft: 14,
    },
    profileName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 3,
    },
    profileEmail: {
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 6,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(10,102,255,0.12)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        gap: 4,
    },
    premiumText: {
        color: '#0A66FF',
        fontSize: 11,
        fontWeight: '700',
    },

    detailContent: {
        paddingTop: 10,
        paddingHorizontal: 24,
        paddingBottom: 116,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 30,
        paddingBottom: 12,
        paddingHorizontal: 18,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        paddingLeft: 14,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.4,
        marginBottom: 1,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '400',
    },
    headerSpacer: {
        width: 42,
    },
    detailHero: {
        alignItems: 'center',
        marginBottom: 34,
    },
    detailAvatar: {
        width: 126,
        height: 126,
        borderRadius: 63,
        backgroundColor: theme.avatarBg,
    },
    onlineDot: {
        position: 'absolute',
        right: 5,
        bottom: 17,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.success,
        borderWidth: 3,
        borderColor: theme.background,
    },
    detailName: {
        color: theme.text,
        fontSize: 24,
        fontWeight: '800',
        marginTop: 18,
    },
    detailEmail: {
        color: theme.textSecondary,
        fontSize: 15,
        fontWeight: '500',
        marginTop: 8,
    },
    joinedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    joinedText: {
        color: theme.textSecondary,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 7,
    },
    infoStack: {
        gap: 14,
        marginBottom: 34,
    },
    infoCard: {
        minHeight: 78,
        ...glassSurface(theme, 'regular', { borderRadius: 18 }),
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIconBox: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        ...glassButton(theme, false, { borderRadius: 14, backgroundColor: theme.avatarBg }),
    },
    infoCopy: {
        flex: 1,
        minWidth: 0,
    },
    infoTitle: {
        color: theme.text,
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 5,
    },
    infoValue: {
        color: theme.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    primaryButton: {
        borderRadius: 18,
        overflow: 'hidden',
        ...glowShadow(theme, theme.electricBlue, 0.28),
    },
    primaryGradient: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    primaryText: {
        color: theme.textInverted,
        fontSize: 16,
        fontWeight: '800',
    },


    saveTopButton: {
        width: 54,
        height: 42,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    saveTopText: {
        color: theme.electricBlue,
        fontSize: 15,
        fontWeight: '800',
    },
    editContent: {
        paddingHorizontal: 22,
        paddingBottom: 116,
    },
    editAvatarWrap: {
        alignSelf: 'center',
        marginTop: 18,
        marginBottom: 26,
    },
    editAvatar: {
        width: 132,
        height: 132,
        borderRadius: 66,
        backgroundColor: theme.avatarBg,
    },
    cameraBadge: {
        position: 'absolute',
        right: -2,
        bottom: 10,
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        ...glassButton(theme, false, { borderRadius: 21 }),
    },
    fieldBlock: {
        marginBottom: 20,
    },
    fieldLabel: {
        color: theme.text,
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 10,
    },
    inputRow: {
        minHeight: 56,
        ...glassInput(theme, false, { borderRadius: 16 }),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        color: theme.text,
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 14,
        paddingVertical: 0,
    },
    aboutBox: {
        minHeight: 112,
        ...glassInput(theme, false, { borderRadius: 16 }),
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 28,
    },
    aboutInput: {
        flex: 1,
        minHeight: 68,
        color: theme.text,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 21,
        padding: 0,
    },
    counterText: {
        position: 'absolute',
        right: 16,
        bottom: 12,
        color: theme.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
});
