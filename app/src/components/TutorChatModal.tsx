import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Speech from 'expo-speech'
import Svg, { Path } from 'react-native-svg'
import { colors, fonts, spacing, radius, typography } from '../constants/theme'
import { useTutorStore, type TutorMessage } from '../stores/tutorStore'

const PRIVACY_LINE = '🔒 對話不會被儲存，關閉 App 後即清除'

const STARTER_PHRASES = [
  'Can we practice ordering food at a restaurant?',
  'How do I sound more natural in meetings?',
  '我想練習用英文自我介紹',
]

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

function SendIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12l16-8-6 16-3-7-7-1z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </Svg>
  )
}

function TypingIndicator() {
  return (
    <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
      <ActivityIndicator color={colors.muted} size="small" />
    </View>
  )
}

function MessageBubble({ message }: { message: TutorMessage }) {
  const isUser = message.role === 'user'

  const handleLongPress = () => {
    if (isUser) return
    // 老師訊息可長按聽 TTS（沿用既有 expo-speech 模式）
    Speech.stop()
    Speech.speak(message.content, { language: 'en-US', rate: 0.9 })
  }

  return (
    <TouchableOpacity
      activeOpacity={isUser ? 1 : 0.7}
      onLongPress={handleLongPress}
      style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}
    >
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.bubbleText}>{message.content}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function TutorChatModal() {
  const { isOpen, messages, loading, remaining, error, close, sendMessage } = useTutorStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<ScrollView>(null)

  // 新訊息 / loading 變化時自動捲到底
  useEffect(() => {
    if (!isOpen) return
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
    return () => clearTimeout(id)
  }, [messages.length, loading, isOpen])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading) return
    Keyboard.dismiss()
    setInput('')
    sendMessage(text)
  }

  const handleStarter = (phrase: string) => {
    if (loading) return
    sendMessage(phrase)
  }

  const handleRetry = () => {
    // 重送最後一則 user 訊息
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) sendMessage(lastUser.content)
  }

  const isEmpty = messages.length === 0
  const canSend = input.trim().length > 0 && !loading

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Polaris</Text>
            <Text style={styles.headerSubtitle}>你的英文引路人</Text>
          </View>
          <View style={styles.headerRight}>
            {remaining != null && (
              <View style={styles.remainingBadge}>
                <Text style={styles.remainingText}>今日免費 {remaining} 則</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.7}>
              <CloseIcon color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy reminder bar — 常駐 */}
        <View style={styles.privacyBar}>
          <Text style={styles.privacyText}>{PRIVACY_LINE}</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
          >
            {isEmpty ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEn}>
                  Hi! I'm Polaris, your English tutor. Tell me anything in English — I'll gently fix mistakes and keep
                  the conversation going.
                </Text>
                <Text style={styles.emptyZh}>
                  用英文跟我聊聊吧，我會溫和地幫你修正並鼓勵你多說。也可以直接用中文發問。
                </Text>
                <Text style={styles.emptyNote}>對話不會被儲存，關閉 App 後即清除。</Text>
                <View style={styles.chips}>
                  {STARTER_PHRASES.map((phrase) => (
                    <TouchableOpacity
                      key={phrase}
                      style={styles.chip}
                      onPress={() => handleStarter(phrase)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{phrase}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              messages.map((m) => <MessageBubble key={m.id} message={m} />)
            )}

            {loading && <TypingIndicator />}

            {/* Error states */}
            {error === 'unauthorized' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>請先登入後即可與老師對話</Text>
              </View>
            )}
            {error === 'daily_limit_reached' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>今天的免費對話額度用完囉，明天再來！</Text>
              </View>
            )}
            {error === 'ai_unavailable' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>老師暫時連不上，請稍後再試</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.7}>
                  <Text style={styles.retryText}>重新傳送</Text>
                </TouchableOpacity>
              </View>
            )}
            {error != null &&
              error !== 'unauthorized' &&
              error !== 'daily_limit_reached' &&
              error !== 'ai_unavailable' && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>發生問題，請稍後再試</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.7}>
                    <Text style={styles.retryText}>重新傳送</Text>
                  </TouchableOpacity>
                </View>
              )}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="輸入訊息…"
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!loading}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.7}
            >
              <SendIcon color={canSend ? colors.bg : colors.muted} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 52,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontFamily: fonts.cinzel,
    fontSize: 16,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  remainingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.gold + '50',
    borderRadius: radius.full,
    backgroundColor: colors.gold + '10',
  },
  remainingText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  privacyBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  privacyText: {
    ...typography.caption,
    fontFamily: fonts.mono,
    color: colors.muted,
    letterSpacing: 0.5,
  },

  messages: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },

  empty: {
    paddingTop: spacing.xl,
  },
  emptyEn: {
    fontFamily: fonts.outfit,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyZh: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  emptyNote: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted2,
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
  },
  chips: {
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 13,
    color: colors.ui,
    lineHeight: 18,
  },

  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: colors.surface3,
    borderColor: colors.border2,
    borderBottomRightRadius: radius.sm,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },

  errorBox: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error + '50',
    backgroundColor: colors.error + '10',
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.error,
  },
  retryBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.error + '60',
    borderRadius: radius.sm,
  },
  retryText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.error,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: spacing.md,
    paddingTop: 9,
    paddingBottom: 9,
    borderRadius: radius.lg,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.surface3,
  },
})
