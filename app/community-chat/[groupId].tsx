import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../../components/ui/AppCard';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { AttachmentAddIcon } from '../../components/ui/SvgIcons';
import { COLORS } from '../../lib/constants';

type ChatAttachment = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  sizeLabel: string;
  uri?: string;
};

type NativeDocumentPickerModule = {
  getDocumentAsync: (options: { multiple?: boolean; copyToCacheDirectory?: boolean; type?: string[] }) => Promise<{
    canceled: boolean;
    assets: Array<{ name: string; uri: string; mimeType?: string | null; size?: number }>;
  }>;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: 'you' | 'community';
  createdAt: string;
  attachments?: ChatAttachment[];
};

const seedMessages: Record<string, ChatMessage[]> = {
  freshers: [
    { id: 'f1', text: 'Welcome! Ask your hostel and timetable questions here.', sender: 'community', createdAt: 'Now' }
  ],
  'food-lovers': [
    { id: 'fl1', text: 'Today menu feedback thread is live.', sender: 'community', createdAt: 'Now' }
  ],
  'study-circle': [
    { id: 's1', text: 'Share your study plan for this week.', sender: 'community', createdAt: 'Now' }
  ],
  placements: [
    { id: 'p1', text: 'Drop your resume tips and interview resources.', sender: 'community', createdAt: 'Now' }
  ],
  events: [
    { id: 'e1', text: 'Post upcoming college events here.', sender: 'community', createdAt: 'Now' }
  ]
};

function formatFileSize(size?: number | null): string {
  if (!size || Number.isNaN(size)) {
    return 'Unknown size';
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function detectType(name: string, mimeType?: string | null): 'pdf' | 'image' | 'doc' {
  const lower = name.toLowerCase();
  if (mimeType?.includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(lower)) {
    return 'image';
  }
  if (mimeType?.includes('pdf') || lower.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'doc';
}

export default function CommunityChatRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string; name?: string }>();
  const groupId = params.groupId ?? 'general';
  const groupName = params.name ?? 'Community Chat';
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);

  const storageKey = useMemo(() => `bmate.chat.${groupId}`, [groupId]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          setMessages(JSON.parse(raw) as ChatMessage[]);
          return;
        }
      } catch {
        // fall back to seed
      }
      setMessages(seedMessages[groupId] ?? []);
    };
    load();
  }, [storageKey, groupId]);

  const persist = async (next: ChatMessage[]) => {
    setMessages(next);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore storage failures to keep chat usable
    }
  };

  const attachFromDevice = async () => {
    try {
      const module = (await import('expo-document-picker/build/ExpoDocumentPicker')).default as NativeDocumentPickerModule;
      const result = await module.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: ['*/*']
      });
      if (result.canceled) {
        return;
      }
      const picked = (result.assets as Array<{ name: string; uri: string; mimeType?: string | null; size?: number }>).map((asset) => ({
        id: `a-${Date.now()}-${Math.random()}`,
        name: asset.name,
        uri: asset.uri,
        type: detectType(asset.name, asset.mimeType),
        sizeLabel: formatFileSize(asset.size)
      })) satisfies ChatAttachment[];
      setPendingAttachments((prev) => [...prev, ...picked]);
    } catch {
      Alert.alert('Attachment unavailable', 'Document picker is not ready in this build. Rebuild app with `npx expo run:android`.');
    }
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const openAttachment = async (attachment: ChatAttachment) => {
    if (!attachment.uri) {
      return;
    }
    const canOpen = await Linking.canOpenURL(attachment.uri);
    if (canOpen) {
      await Linking.openURL(attachment.uri);
    }
  };

  const deleteMessage = (messageId: string) => {
    Alert.alert('Delete message', 'Delete this sent message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const next = messages.filter((message) => message.id !== messageId);
          await persist(next);
        }
      }
    ]);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text && pendingAttachments.length === 0) {
      return;
    }
    const next: ChatMessage[] = [
      ...messages,
      {
        id: `m-${Date.now()}`,
        text,
        sender: 'you',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined
      }
    ];
    setDraft('');
    setPendingAttachments([]);
    await persist(next);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{groupName}</Text>
        <MaterialCommunityIcons name="account-group-outline" size={20} color="#64748B" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.msgRow, msg.sender === 'you' && styles.msgRowYou]}>
            <AppCard style={[styles.msgBubble, msg.sender === 'you' ? styles.msgYou : styles.msgCommunity]}>
              {msg.text ? <Text style={[styles.msgText, msg.sender === 'you' && styles.msgTextYou]}>{msg.text}</Text> : null}
              {msg.attachments?.length ? (
                <View style={styles.attachmentList}>
                  {msg.attachments.map((attachment) => (
                    <Pressable
                      key={attachment.id}
                      onPress={() => openAttachment(attachment)}
                      style={[styles.attachmentCard, msg.sender === 'you' && styles.attachmentCardYou]}
                    >
                      <MaterialCommunityIcons
                        name={attachment.type === 'image' ? 'image-outline' : attachment.type === 'pdf' ? 'file-pdf-box' : 'file-document-outline'}
                        size={16}
                        color={msg.sender === 'you' ? '#DDD6FE' : '#5B21B6'}
                      />
                      <View style={styles.attachmentMeta}>
                        <Text style={[styles.attachmentName, msg.sender === 'you' && styles.attachmentNameYou]} numberOfLines={1}>
                          {attachment.name}
                        </Text>
                        <Text style={[styles.attachmentSize, msg.sender === 'you' && styles.attachmentSizeYou]}>{attachment.sizeLabel}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <View style={styles.messageStatusRow}>
                <Text style={[styles.msgTime, msg.sender === 'you' && styles.msgTimeYou]}>{msg.createdAt}</Text>
                {msg.sender === 'you' ? (
                  <View style={styles.sentState}>
                    <Pressable onPress={() => deleteMessage(msg.id)} hitSlop={8}>
                      <MaterialCommunityIcons name="trash-can-outline" size={13} color="#DDD6FE" />
                    </Pressable>
                    <MaterialCommunityIcons name="check-all" size={12} color="#C4B5FD" />
                    <Text style={styles.sentLabel}>Sent</Text>
                  </View>
                ) : null}
              </View>
            </AppCard>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {pendingAttachments.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pendingAttachmentRow}>
            {pendingAttachments.map((attachment) => (
              <View key={attachment.id} style={styles.pendingAttachmentChip}>
                <MaterialCommunityIcons
                  name={attachment.type === 'image' ? 'image-outline' : attachment.type === 'pdf' ? 'file-pdf-box' : 'file-document-outline'}
                  size={14}
                  color="#5B21B6"
                />
                <Text style={styles.pendingAttachmentText} numberOfLines={1}>{attachment.name}</Text>
                <Pressable onPress={() => removePendingAttachment(attachment.id)}>
                  <MaterialCommunityIcons name="close-circle" size={16} color="#7C3AED" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.composerRow}>
          <Pressable style={styles.attachButton} onPress={attachFromDevice}>
            <AttachmentAddIcon size={20} color="#6D28D9" />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            multiline
          />
          <PrimaryButton label="Send" onPress={send} style={styles.sendBtn} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF2F7' },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  content: { padding: 12, gap: 8, paddingBottom: 100 },
  msgRow: { alignItems: 'flex-start' },
  msgRowYou: { alignItems: 'flex-end' },
  msgBubble: { padding: 10, maxWidth: '84%' },
  msgCommunity: { backgroundColor: '#FFFFFF' },
  msgYou: { backgroundColor: '#5B21B6' },
  msgText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  msgTextYou: { color: '#FFFFFF' },
  attachmentList: { gap: 6, marginTop: 4 },
  attachmentCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8B4FE',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 210,
    maxWidth: 260
  },
  attachmentCardYou: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(76, 29, 149, 0.38)'
  },
  attachmentMeta: { flex: 1 },
  attachmentName: { color: '#4C1D95', fontSize: 12, fontWeight: '700' },
  attachmentNameYou: { color: '#FFFFFF' },
  attachmentSize: { color: '#6B7280', fontSize: 10, fontWeight: '600', marginTop: 1 },
  attachmentSizeYou: { color: '#DDD6FE' },
  messageStatusRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  msgTime: { marginTop: 4, color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  msgTimeYou: { color: '#DDD6FE' },
  sentState: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sentLabel: { color: '#DDD6FE', fontSize: 10, fontWeight: '700' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 8
  },
  pendingAttachmentRow: { gap: 8 },
  pendingAttachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#D8B4FE',
    backgroundColor: '#F5F3FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 220
  },
  pendingAttachmentText: { color: '#4C1D95', fontSize: 11, fontWeight: '700', maxWidth: 150 },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8B4FE',
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    minHeight: 40,
    maxHeight: 90,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600'
  },
  sendBtn: { width: 84, alignSelf: 'flex-end' }
});
