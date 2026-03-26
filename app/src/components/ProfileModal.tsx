import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
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
      Alert.alert('Success', '10 credits added!')
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

              <Text style={styles.sectionLabel}>ACCOUNT</Text>
              <Text style={styles.email}>{user?.email ?? '—'}</Text>

              <View style={styles.divider} />

              <View style={styles.creditsRow}>
                <Text style={styles.creditsLabel}>CREDITS</Text>
                <Text style={styles.creditsValue}>{balance}</Text>
              </View>

              <TouchableOpacity
                style={[styles.buyBtn, purchasing && styles.buyBtnDisabled]}
                onPress={handleBuyCredits}
                disabled={purchasing}
              >
                <Text style={styles.buyBtnText}>
                  {purchasing ? 'PROCESSING...' : 'BUY 10 CREDITS  NT$60'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <Text style={styles.signOutText}>SIGN OUT</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  creditsLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.muted,
  },
  creditsValue: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.ui,
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
})
