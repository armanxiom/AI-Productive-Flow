import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";
import { QuickCapture } from "@/components/QuickCapture";

function Greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, tasks, tags, updateNote } = useApp();
  const [showCapture, setShowCapture] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const inboxNotes = notes.filter((n) => n.isInbox);
  const favoriteNotes = notes.filter((n) => n.isFavorite);
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {Greeting()}
            </Text>
            <Text style={[styles.appName, { color: colors.foreground }]}>Ideaso</Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{today}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            hitSlop={10}
            activeOpacity={0.7}
            style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.primary + "18", borderRadius: colors.radius }]}
            onPress={() => router.push("/(tabs)/notes" as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.statNum, { color: colors.primary }]}>{notes.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: "#F59E0B18", borderRadius: colors.radius }]}
            onPress={() => router.push("/(tabs)/tasks" as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.statNum, { color: "#F59E0B" }]}>{todoCount + inProgressCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Active Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: "#10B98118", borderRadius: colors.radius }]}
            onPress={() => router.push("/(tabs)/inbox" as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.statNum, { color: "#10B981" }]}>{inboxNotes.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Inbox</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Capture */}
        {showCapture ? (
          <QuickCapture onCapture={() => setShowCapture(false)} />
        ) : null}

        {/* Favorites */}
        {favoriteNotes.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="star" size={14} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Favorites</Text>
            </View>
            <FlatList
              data={favoriteNotes}
              keyExtractor={(n) => n.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <View style={{ width: 220 }}>
                  <NoteCard
                    note={item}
                    tags={tags}
                    onPress={() => router.push(`/notes/${item.id}` as any)}
                    onFavoriteToggle={() => updateNote(item.id, { isFavorite: !item.isFavorite })}
                    compact
                  />
                </View>
              )}
            />
          </View>
        ) : null}

        {/* Recent Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="clock" size={14} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/notes" as any)}
              hitSlop={8}
              style={styles.seeAll}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentNotes.length === 0 ? (
            <EmptyState
              icon="file-text"
              title="No notes yet"
              subtitle="Capture your first idea below"
              actionLabel="New Note"
              onAction={() => setShowCapture(true)}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  tags={tags}
                  onPress={() => router.push(`/notes/${note.id}` as any)}
                  onFavoriteToggle={() => updateNote(note.id, { isFavorite: !note.isFavorite })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.primary, bottom: (Platform.OS === "web" ? 84 : insets.bottom + 76) },
        ]}
        onPress={() => setShowCapture((v) => !v)}
        activeOpacity={0.85}
      >
        <Feather name={showCapture ? "x" : "zap"} size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statNum: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  seeAll: { paddingVertical: 2 },
  seeAllText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  fab: {
    position: "absolute",
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
