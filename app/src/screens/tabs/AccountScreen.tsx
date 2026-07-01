import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, fonts, spacing, radius } from '../../constants/theme'
import { useAuthStore } from '../../stores/authStore'
import { useCreditsStore } from '../../stores/creditsStore'

const PRIVACY_URL = 'https://sav-daily-english.netlify.app/privacy-policy.html'
const TERMS_URL = 'https://sav-daily-english.netlify.app/terms-of-service.html'
const BUY_CREDITS_AMOUNT = 10
const BUY_CREDITS_PRICE = 'NT$60'

export default function AccountScreen() {
  const { user, signOut } = useAuthStore()
  const { balance, purchasing, purchaseCredits } = useCreditsStore()

  const handleBuyCredits = async () => {
    const result = await purchaseCredits()
    if (result.success) {
      Alert.alert('Success', `${BUY_CREDITS_AMOUNT} credits added to your account.`)
    } else if (result.error) {
      Alert.alert('Purchase failed', result.error)
    }
  }

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Credits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CREDITS</Text>
          <View style={styles.creditsDisplay}>
            <Text style={styles.creditsNumber}>{balance}</Text>
            <Text style={styles.creditsUnit}>credits</Text>
          </View>
          <Text style={styles.creditsHint}>
            Each AI feedback uses 1 credit. New users start with 3 free credits.
          </Text>
          <TouchableOpacity
            style={[styles.buyBtn, purchasing && styles.buyBtnDisabled]}
            onPress={handleBuyCredits}
            disabled={purchasing}
          >
            <Text style={styles.buyBtnText}>
              {purchasing ? 'PROCESSING...' : `BUY ${BUY_CREDITS_AMOUNT} CREDITS  ${BUY_CREDITS_PRICE}`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <Text style={styles.emailText}>{user?.email ?? '—'}</Text>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <Text style={styles.legalArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={styles.legalText}>Terms of Service</Text>
            <Text style={styles.legalArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Notch Up! · v1.0.0</Text>
        <Text style={styles.endorsement}>A Study Anywhere Voyage product</Text>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 60 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  creditsDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  creditsNumber: {
    fontFamily: fonts.mono,
    fontSize: 48,
    color: colors.ui,
    lineHeight: 56,
  },
  creditsUnit: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 1,
  },
  creditsHint: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  buyBtn: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.ui,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buyBtnDisabled: { opacity: 0.5 },
  buyBtnText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.ui,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  emailText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  signOutBtn: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.error + '60',
    borderRadius: radius.md,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.error,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legalText: {
    fontSize: 14,
    color: colors.text,
  },
  legalArrow: {
    fontSize: 18,
    color: colors.muted,
  },
  version: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.muted2,
    textAlign: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  endorsement: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.muted2,
    textAlign: 'center',
    paddingBottom: spacing.lg,
  },
})
