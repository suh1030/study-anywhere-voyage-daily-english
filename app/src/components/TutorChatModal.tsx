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

const PRIVACY_LINE = '對話不會被儲存，關閉 App 後即清除'
const TUTOR_DAILY_LIMIT = 30 // 與後端 DAILY_LIMIT 一致

// 把 **粗體** 標記渲染成實際粗體（模型常用來標正確說法）
function renderRich(text: string, boldStyle: object) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <Text key={i} style={boldStyle}>{part.slice(2, -2)}</Text>
    ) : (
      part
    )
  )
}

const STARTER_PHRASES = [
  '我想練習用英文自我介紹',
  '我最近的學習進度如何？',
  'Can we practice ordering food at a restaurant?',
]

const CONTEXT_STARTER_PHRASES = [
  '解釋目前這段內容',
  '幫我用這個造句',
  '這裡最容易錯哪裡？',
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

function WarnIcon({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5L21.5 20H2.5L12 3.5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M12 10v4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Path d="M12 17.2h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
        <Text style={styles.bubbleText}>{renderRich(message.content, styles.bubbleBold)}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function TutorChatModal() {
  const { isOpen, messages, activeLearningContext, loading, remaining, error, close, sendMessage } = useTutorStore()
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
                <Text style={styles.remainingText}>今日可用 {remaining}/{TUTOR_DAILY_LIMIT} 則</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.7}>
              <CloseIcon color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy reminder bar — 常駐 */}
        <View style={styles.privacyBar}>
          <WarnIcon color={colors.warning} />
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
                <Text style={styles.emptyLead}>
                  嗨，我是 Polaris，你的英文學習引路人。任何英文學習問題都可以問我，也能查你的進度、字卡，或哪天沒打卡。
                </Text>
                <Text style={styles.emptySub}>
                  {activeLearningContext
                    ? `我看得到你目前在 ${activeLearningContext.screen} 的學習內容，可以直接問我這段怎麼用。`
                    : "Let's get started — tell me anything in English, and I'll help you make it sound natural."}
                </Text>
                <View style={styles.chips}>
                  {(activeLearningContext ? CONTEXT_STARTER_PHRASES : STARTER_PHRASES).map((phrase) => (
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  emptyLead: {
    fontSize: 15,
    lineHeight: 25,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontFamily: fonts.outfit,
    fontSize: 14,
    lineHeight: 21,
    color: colors.uiDim,
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
  bubbleBold: {
    fontWeight: '700',
    color: colors.gold2,
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
