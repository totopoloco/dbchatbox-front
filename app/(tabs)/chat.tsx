import { gql, useLazyQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { getLocales } from 'expo-localization';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated';

import { BrandColors } from '@/constants/theme';

const ASK_QUERY = gql`
  query Ask($input: AskInput!) {
    ask(input: $input) {
      answer
      toolCalls {
        name
        arguments
        durationMillis
        error
      }
    }
  }
`;

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

const EXAMPLE_PROMPTS = [
  'Who has unpaid dues?',
  'When is my next training session?',
  'How many hours did the trainers work this month?',
  'Which memberships expire soon?',
];

const MAX_CHARS = 1000;

function TypingIndicator() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animate = (val: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        val.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          false
        );
      }, delay);
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.typingContainer}>
      <View style={styles.assistantBubble}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, style1]} />
          <Animated.View style={[styles.dot, style2]} />
          <Animated.View style={[styles.dot, style3]} />
        </View>
      </View>
    </View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          message.isError && styles.errorBubble,
        ]}>
        <Text
          style={[
            styles.bubbleText,
            isUser ? styles.userText : styles.assistantText,
            message.isError && styles.errorText,
          ]}>
          {message.text}
        </Text>
      </View>
      <Text style={[styles.timestamp, isUser ? styles.timestampRight : styles.timestampLeft]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [askQuery] = useLazyQuery(ASK_QUERY);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    setMessages((prev) => [
      {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: new Date(),
      },
      ...prev,
    ]);
    setInputText('');
    setLoading(true);

    try {
      const result = await askQuery({
        variables: {
          input: {
            prompt: text,
            locale: getLocales()[0]?.languageTag ?? 'en',
          },
        },
      });
      const answer = (result.data as { ask?: { answer?: string } } | undefined)?.ask?.answer ?? 'No response received.';
      setMessages((prev) => [
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: answer,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    } catch {
      setMessages((prev) => [
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
          isError: true,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const charsRemaining = MAX_CHARS - inputText.length;
  const canSend = inputText.trim().length > 0 && !loading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {messages.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ask anything about the club</Text>
            <View style={styles.chipGrid}>
              {EXAMPLE_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.chip}
                  onPress={() => setInputText(prompt)}>
                  <Text style={styles.chipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            inverted
            contentContainerStyle={styles.messageList}
            ListHeaderComponent={loading ? <TypingIndicator /> : null}
          />
        )}

        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything about the club…"
              placeholderTextColor={BrandColors.light.onSurfaceVariant}
              multiline
              maxLength={MAX_CHARS}
              returnKeyType="default"
            />
            {charsRemaining <= 100 && (
              <Text style={styles.charCounter}>{charsRemaining}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}>
            <MaterialIcons
              name="send"
              size={24}
              color={canSend ? BrandColors.light.primary : BrandColors.light.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.light.background,
  },
  flex: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BrandColors.light.onSurface,
    marginBottom: 24,
    textAlign: 'center',
  },
  chipGrid: {
    width: '100%',
    gap: 12,
  },
  chip: {
    backgroundColor: BrandColors.light.surfaceVariant,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: BrandColors.light.outline,
  },
  chipText: {
    fontSize: 15,
    color: BrandColors.light.onSurface,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bubbleRow: {
    marginVertical: 4,
  },
  bubbleRowRight: {
    alignItems: 'flex-end',
  },
  bubbleRowLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: BrandColors.light.primary,
    borderRadius: 16,
    borderBottomRightRadius: 0,
  },
  assistantBubble: {
    backgroundColor: BrandColors.light.surfaceVariant,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
  },
  errorBubble: {
    backgroundColor: BrandColors.light.error,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: BrandColors.light.onPrimary,
  },
  assistantText: {
    color: BrandColors.light.onSurface,
  },
  errorText: {
    color: BrandColors.light.onError,
  },
  timestamp: {
    fontSize: 11,
    color: BrandColors.light.onSurfaceVariant,
    marginTop: 2,
    marginHorizontal: 4,
  },
  timestampRight: {
    textAlign: 'right',
  },
  timestampLeft: {
    textAlign: 'left',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.light.onSurfaceVariant,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: BrandColors.light.outline,
    backgroundColor: BrandColors.light.background,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    backgroundColor: BrandColors.light.surface,
    borderWidth: 1,
    borderColor: BrandColors.light.outline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: 24,
    fontSize: 15,
    color: BrandColors.light.onSurface,
    maxHeight: 110,
  },
  charCounter: {
    position: 'absolute',
    bottom: 6,
    right: 10,
    fontSize: 11,
    color: BrandColors.light.onSurfaceVariant,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: BrandColors.light.surfaceVariant,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
