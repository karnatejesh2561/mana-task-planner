import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { glassPanel } from '../theme/glass';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    const { theme, colorScheme, t } = useApp();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }, glassPanel(theme)]}>
                <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)' }]} activeOpacity={0.8}>
                    <Ionicons name="chevron-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('privacyPolicy')}</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{t('privacyPolicySubtitle')}</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacyPolicyEffectiveDate')}</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    {t('privacyPolicyIntro')}
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacyPolicySection1Title')}</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    {t('privacyPolicySection1Text')}
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacyPolicySection2Title')}</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    {t('privacyPolicySection2Text')}
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacyPolicySection3Title')}</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    {t('privacyPolicySection3Text')}
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('privacyPolicySection4Title')}</Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                    {t('privacyPolicySection4Text')}
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 30,
        paddingBottom: 12,
        paddingHorizontal: 16,
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
    content: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 140,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
    },
});
