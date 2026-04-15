// Pricing constants — update here if price changes
const BUY_CREDITS_AMOUNT = 10
const BUY_CREDITS_PRICE = 'NT$60'

const PRIVACY_URL = 'https://sav-daily-english.netlify.app/privacy-policy.html'
const TERMS_URL = 'https://sav-daily-english.netlify.app/terms-of-service.html'

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Linking,
} from 'react-native'
import { colors, fonts, spacing, radius } from '../constants/theme'
import { useAuthStore } from '../stores/authStore'
import { useCreditsStore } from '../stores/creditsStore'

interface Props {
  visible: boolean
  onClose: () => void
}

export default function ProfileModal({ visible, onClose }: Props) {
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
    onClose()
    await signOut()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />

              {/* Credits Section */}
              <Text style={styles.sectionLabel}>CREDITS</Text>
              <View style={styles.creditsRow}>
                <Text style={styles.creditsBalance}>{balance}</Text>
                <Text style={styles.creditsUnit}>credits remaining</Text>
              </View>
              <TouchableOpacity
                style={[styles.buyBtn, purchasing && styles.buyBtnDisabled]}
                onPress={handleBuyCredits}
                disabled={purchasing}
              >
                <Text style={styles.buyBtnText}>
                  {purchasing ? 'PROCESSING...' : `BUY ${BUY_CREDITS_AMOUNT} CREDITS  ${BUY_CREDITS_PRICE}`}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Account Section */}
              <Text style={styles.sectionLabel}>ACCOUNT</Text>
              <Text style={styles.email}>{user?.email ?? '—'}</Text>
              <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <Text style={styles.signOutText}>SIGN OUT</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>

              <View style={styles.legalRow}>
                <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
                  <Text style={styles.legalLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.legalSep}>·</Text>
                <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
                  <Text style={styles.legalLink}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    paddingTop: spacing.md,
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  creditsBalance: {
    fontFamily: fonts.mono,
    fontSize: 32,
    color: colors.ui,
  },
  creditsUnit: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
  },
  buyBtn: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.ui,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    opacity: 0.5,
  },
  buyBtnText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.ui,
  },
  signOutBtn: {
    marginTop: spacing.md,
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
  cancelBtn: {
    marginTop: spacing.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.muted,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  legalLink: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted2,
    textDecorationLine: 'underline',
  },
  legalSep: {
    fontSize: 10,
    color: colors.muted2,
  },
})
