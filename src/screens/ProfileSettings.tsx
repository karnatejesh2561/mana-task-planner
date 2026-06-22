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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { LANGUAGE_LABELS } from '../i18n';

interface ProfileSettingsProps {
    onNavigate: (screen: string) => void;
    onLogout?: () => void;
}

type ProfileMode = 'settings' | 'details' | 'edit';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=240&h=240&fit=crop&q=90';
const MAX_ABOUT = 120;

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onLogout }) => {
    const { user, theme, colorScheme, toggleTheme, language, toggleLanguage, updateProfile, t } = useApp();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [mode, setMode] = useState<ProfileMode>('settings');
    const [name, setName] = useState(user?.name || 'Hemanth');
    const [email, setEmail] = useState(user?.email || 'hemanth@example.com');
    const [password, setPassword] = useState(user?.password || 'password123');
    const [about, setAbout] = useState(user?.about || 'Building products that make life simple and productive.');
    const [photoUri, setPhotoUri] = useState(user?.photoUri || DEFAULT_AVATAR);

    useEffect(() => {
        setName(user?.name || 'Hemanth');
        setEmail(user?.email || 'hemanth@example.com');
        setPassword(user?.password || 'password123');
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

    const saveProfile = () => {
        const result = updateProfile({ name, email, about, password, photoUri });
        if (!result.success) {
            Alert.alert(t('updateProfile'), result.error || t('comingSoon', { title: t('updateProfile') }));
            return;
        }
        setMode('details');
    };

    if (mode === 'edit') {
        return (
            <View style={styles.screen}>
                <View style={styles.editHeader}>
                    <TouchableOpacity style={styles.headerIconButton} onPress={() => setMode('details')} activeOpacity={0.82}>
                        <Ionicons name="chevron-back" size={24} color={theme.icon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('editProfile')}</Text>
                    <TouchableOpacity style={styles.saveTopButton} onPress={saveProfile} activeOpacity={0.82}>
                        <Text style={styles.saveTopText}>{t('save')}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editContent}>
                    <TouchableOpacity style={styles.editAvatarWrap} onPress={pickImage} activeOpacity={0.85}>
                        <Image source={{ uri: photoUri }} style={styles.editAvatar} />
                        <View style={styles.cameraBadge}>
                            <Ionicons name="camera-outline" size={22} color={theme.purpleAccent} />
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

                    <TouchableOpacity style={styles.primaryButton} onPress={saveProfile} activeOpacity={0.88}>
                        <LinearGradient colors={[theme.purpleAccent, theme.brightBlue]} style={styles.primaryGradient}>
                            <Text style={styles.primaryText}>{t('saveChanges')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    if (mode === 'details') {
        return (
            <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
                <View style={styles.detailTopBar}>
                    <TouchableOpacity style={styles.headerIconButton} onPress={() => setMode('settings')} activeOpacity={0.82}>
                        <Ionicons name="chevron-back" size={24} color={theme.icon} />
                    </TouchableOpacity>

                </View>

                <View style={styles.detailHero}>
                    <View>
                        <Image source={{ uri: photoUri }} style={styles.detailAvatar} />
                        <View style={styles.onlineDot} />
                    </View>
                    <Text style={styles.detailName}>{name}</Text>
                    <Text style={styles.detailEmail}>{email}</Text>
                    <View style={styles.joinedRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                        <Text style={styles.joinedText}>{t('joined', { date: user?.joinedAt || 'May 2024' })}</Text>
                    </View>
                </View>

                <View style={styles.infoStack}>
                    <InfoCard icon="person-outline" title={t('aboutYou')} value={about} styles={styles} theme={theme} />
                    <InfoCard icon="mail-outline" title={t('email')} value={email} styles={styles} theme={theme} />
                    <InfoCard icon="lock-closed-outline" title={t('password')} value="********" styles={styles} theme={theme} />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={() => setMode('edit')} activeOpacity={0.88}>
                    <LinearGradient colors={[theme.purpleAccent, theme.brightBlue]} style={styles.primaryGradient}>
                        <Ionicons name="pencil-outline" size={21} color={theme.textInverted} />
                        <Text style={styles.primaryText}>{t('editProfile')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} contentContainerStyle={styles.settingsContent}>
            <Text style={styles.title}>{t('profile')}</Text>

            <TouchableOpacity style={styles.profileCard} activeOpacity={0.85} onPress={() => setMode('details')}>
                <Image source={{ uri: photoUri }} style={styles.profileAvatar} />
                <View style={styles.profileCopy}>
                    <Text style={styles.profileName}>{name}</Text>
                    <Text style={styles.profileEmail}>{email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.groupLabel}>{t('account')}</Text>
            <View style={styles.groupCard}>
                <SettingRow icon="person-outline" title={t('profile')} onPress={() => setMode('details')} styles={styles} theme={theme} />
                <SettingRow icon="notifications-outline" title={t('notifications')} onPress={() => Alert.alert(t('notifications'), t('notificationSettingsSoon'))} styles={styles} theme={theme} />
                <SettingRow icon="time-outline" title={t('defaultReminder')} onPress={() => Alert.alert(t('defaultReminder'), t('reminderSettingsSoon'))} styles={styles} theme={theme} />
                <SettingRow icon="moon-outline" title={t('appearance')} value={colorScheme === 'dark' ? t('dark') : t('light')} onPress={toggleTheme} styles={styles} theme={theme} />
                <SettingRow
                    icon="globe-outline"
                    title={t('language')}
                    value={LANGUAGE_LABELS[language]}
                    onPress={() => {
                        const nextLanguage = language === 'en' ? 'te' : 'en';
                        toggleLanguage();
                        Alert.alert(t('languageChangedTitle'), t('languageChangedMessage', { language: LANGUAGE_LABELS[nextLanguage] }));
                    }}
                    styles={styles}
                    theme={theme}
                    isLast
                />
            </View>

            <Text style={styles.groupLabel}>{t('others')}</Text>
            <View style={styles.groupCard}>
                <SettingRow icon="shield-checkmark-outline" title={t('privacyPolicy')} onPress={() => Alert.alert(t('privacyPolicy'), t('privacyDetailsSoon'))} styles={styles} theme={theme} />
                <SettingRow icon="information-circle-outline" title={t('aboutManaTask')} onPress={() => Alert.alert(t('aboutManaTask'), t('manaTaskVersion'))} styles={styles} theme={theme} isLast />
            </View>

            <TouchableOpacity style={styles.logoutCard} activeOpacity={0.85} onPress={onLogout}>
                <Ionicons name="log-out-outline" size={23} color={theme.error} />
                <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const SettingRow = ({
    icon,
    title,
    value,
    onPress,
    isLast,
    styles,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    onPress: () => void;
    isLast?: boolean;
    styles: ReturnType<typeof createStyles>;
    theme: AppTheme;
}) => (
    <TouchableOpacity style={[styles.settingRow, !isLast && styles.settingDivider]} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.settingLeft}>
            <Ionicons name={icon} size={22} color={theme.purpleAccent} />
            <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <View style={styles.settingRight}>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </View>
    </TouchableOpacity>
);

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
            <Ionicons name={icon} size={25} color={theme.purpleAccent} />
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
            <Ionicons name={icon} size={23} color={theme.purpleAccent} />
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
            {trailing && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
        </View>
    </View>
);

const createStyles = (theme: AppTheme) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.background,
    },
    settingsContent: {
        paddingTop: 62,
        paddingHorizontal: 22,
        paddingBottom: 116,
    },
    title: {
        color: theme.text,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 24,
    },
    profileCard: {
        minHeight: 116,
        backgroundColor: theme.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        shadowRadius: 18,
        elevation: 3,
    },
    profileAvatar: {
        width: 65,
        height: 65,
        borderRadius: 36,
        backgroundColor: theme.avatarBg,
    },
    profileCopy: {
        flex: 1,
        minWidth: 0,
        marginLeft: 16,
    },
    profileName: {
        color: theme.text,
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 7,
    },
    profileEmail: {
        color: theme.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    groupLabel: {
        color: theme.textSecondary,
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 10,
        marginTop: 8,
    },
    groupCard: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: theme.cardShadowOpacity,
        shadowRadius: 18,
        elevation: 3,
    },
    settingRow: {
        minHeight: 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingDivider: {
        borderBottomWidth: 1,
        borderBottomColor: theme.divider,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    settingTitle: {
        color: theme.text,
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 18,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    settingValue: {
        color: theme.textSecondary,
        fontSize: 13,
        fontWeight: '600',
        marginRight: 8,
    },
    logoutCard: {
        minHeight: 56,
        backgroundColor: theme.scheme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FFF0F0',
        borderRadius: 12,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        color: theme.error,
        fontSize: 15,
        fontWeight: '800',
        marginLeft: 16,
    },
    detailContent: {
        paddingTop: 56,
        paddingHorizontal: 24,
        paddingBottom: 116,
    },
    detailTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 26,
    },
    headerIconButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: theme.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: theme.cardShadowOpacity,
        shadowRadius: 18,
        elevation: 3,
    },
    infoIconBox: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: theme.scheme === 'dark' ? 'rgba(109,74,255,0.16)' : '#F1ECFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
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
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: theme.purpleAccent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 6,
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
    editHeader: {
        height: 104,
        paddingTop: 44,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: theme.text,
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
        color: theme.purpleAccent,
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
        borderRadius: 21,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: theme.cardShadowOpacity,
        shadowRadius: 12,
        elevation: 4,
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
        borderRadius: 10,
        backgroundColor: theme.input,
        borderWidth: 1,
        borderColor: theme.divider,
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
        borderRadius: 10,
        backgroundColor: theme.input,
        borderWidth: 1,
        borderColor: theme.divider,
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
