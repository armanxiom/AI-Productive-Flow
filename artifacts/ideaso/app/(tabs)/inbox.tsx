import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { NoteCard } from "@/components/NoteCard";
import { QuickCapture } from "@/components/QuickCapture";
import { EmptyState } from "@/components/EmptyState";

export default function InboxScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, tags, updateNote, deleteNote } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const inboxNotes = [...notes]
    .filter((n) => n.isInbox)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const moveToNotes = async (id: string) => {
    await updateNote(id, { isInbox: false });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const archive = async (id: string) => {
    await deleteNote(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="inbox" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Inbox</Text>
          </View>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {inboxNotes.length} items
          </Text>
        </View>

        {/* Quick Capture */}
        <QuickCapture />

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Inbox items */}
        {inboxNotes.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Inbox is clear"
            subtitle="Capture ideas above — they land here first."
          />
        ) : (
          <View style={{ gap: 10 }}>
            {inboxNotes.map((note) => (
              <View key={note.id}>
                <NoteCard
                  note={note}
                  tags={tags}
                  onPress={() => router.push(`/notes/${note.id}` as any)}
                  onFavoriteToggle={() => updateNote(note.id, { isFavorite: !note.isFavorite })}
                />
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary + "18", borderRadius: 10 }]}
                    onPress={() => moveToNotes(note.id)}
                    activeOpacity={0.8}
                  >
                    <Feather name="arrow-right" size={14} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Move to Notes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.destructive + "18", borderRadius: 10 }]}
                    onPress={() => archive(note.id)}
                    activeOpacity={0.8}
                  >
                    <Feather name="trash-2" size={14} color={colors.destructive} />
                    <Text style={[styles.actionText, { color: colors.destructive }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  count: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  divider: { height: 1, marginVertical: 4 },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
});
