import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { colors, typography, spacing, radius, fonts } from '../../constants/theme'
import { useAuthStore } from '../../stores/authStore'

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const { signInWithEmail, signUpWithEmail, signInWithApple, signInWithGoogle } = useAuthStore()

  const handleSubmit = async () => {
    setAuthError('')
    if (!email.trim() || !password.trim()) {
      setAuthError('Please fill in all fields.')
      return
    }
    setLoading(true)
    const error = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password)
    setLoading(false)

    if (error) {
      setAuthError(error)
    } else if (isSignUp) {
      setSignUpSuccess(true)
    }
  }

  const handleAppleSignIn = async () => {
    setAuthError('')
    setAppleLoading(true)
    const error = await signInWithApple()
    setAppleLoading(false)
    if (error) setAuthError(error)
  }

  const handleGoogleSignIn = async () => {
    setAuthError('')
    setGoogleLoading(true)
    const error = await signInWithGoogle()
    setGoogleLoading(false)
    if (error) setAuthError(error)
  }

  if (signUpSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.brand}>SAV</Text>
          <Text style={styles.subtitle}>DAILY ENGLISH</Text>
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>CHECK YOUR EMAIL</Text>
            <Text style={styles.successText}>
              We sent a confirmation link to{'\n'}<Text style={styles.successEmail}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>Click the link in the email to activate your account, then come back to sign in.</Text>
          </View>
          <TouchableOpacity onPress={() => { setSignUpSuccess(false); setIsSignUp(false) }}>
            <Text style={styles.switchText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.brand}>SAV</Text>
        <Text style={styles.subtitle}>DAILY ENGLISH</Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, authError ? styles.inputError : null]}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={(v) => { setEmail(v); setAuthError('') }}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={[styles.input, authError ? styles.inputError : null]}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={(v) => { setPassword(v); setAuthError('') }}
            secureTextEntry
            textContentType={isSignUp ? 'newPassword' : 'password'}
          />

          {authError ? (
            <Text style={styles.errorText}>{authError}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isSignUp ? 'SIGN UP' : 'SIGN IN'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setAuthError('') }}>
            <Text style={styles.switchText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === 'ios' && (
            appleLoading ? (
              <View style={styles.socialLoadingRow}>
                <ActivityIndicator color={colors.ui} />
              </View>
            ) : (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={radius.sm}
                style={styles.socialBtn}
                onPress={handleAppleSignIn}
              />
            )
          )}

          {googleLoading ? (
            <View style={styles.socialLoadingRow}>
              <ActivityIndicator color={colors.ui} />
            </View>
          ) : (
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  brand: {
    fontSize: 48,
    fontWeight: '200',
    color: colors.ui,
    letterSpacing: 12,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 4,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  inputError: {
    borderColor: colors.error + '80',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -spacing.sm,
    paddingHorizontal: 2,
  },
  primaryBtn: {
    backgroundColor: colors.ui,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.bg,
    fontWeight: '500',
  },
  switchText: {
    ...typography.caption,
    color: colors.uiDim,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border2,
  },
  dividerText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
  },
  socialBtn: {
    width: '100%',
    height: 48,
  },
  socialLoadingRow: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtn: {
    width: '100%',
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.text,
  },
  successBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.ui,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  successEmail: {
    color: colors.ui,
    fontWeight: '600',
  },
  successHint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
})
