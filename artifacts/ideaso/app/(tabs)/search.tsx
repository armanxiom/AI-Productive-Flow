import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { NoteCard } from "@/components/NoteCard";
import { TaskCard } from "@/components/TaskCard";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, tasks, tags, updateNote, updateTask, deleteTask } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { matchedNotes, matchedTasks } = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { matchedNotes: [], matchedTasks: [] };
    const matchedNotes = notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
    const matchedTasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false)
    );
    return { matchedNotes, matchedTasks };
  }, [query, notes, tasks]);

  const totalResults = matchedNotes.length + matchedTasks.length;
  const hasQuery = query.trim().length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>

        {/* Search Input */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.primary, borderRadius: colors.radius },
          ]}
        >
          <Feather name="search" size={18} color={colors.primary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search notes, tasks..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>

        {!hasQuery ? (
          <View style={styles.emptyHint}>
            <Feather name="search" size={48} color={colors.border} />
            <Text style={[styles.hintTitle, { color: colors.mutedForeground }]}>
              Start typing to search
            </Text>
            <Text style={[styles.hintSub, { color: colors.mutedForeground }]}>
              Searches across all notes and tasks instantly
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {totalResults === 0
                ? "No results"
                : `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${query}"`}
            </Text>

            {matchedNotes.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="file-text" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                    Notes ({matchedNotes.length})
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  {matchedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      tags={tags}
                      onPress={() => router.push(`/notes/${note.id}` as any)}
                      onFavoriteToggle={() => updateNote(note.id, { isFavorite: !note.isFavorite })}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {matchedTasks.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="check-square" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                    Tasks ({matchedTasks.length})
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  {matchedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      tags={tags}
                      onStatusChange={(status) => updateTask(task.id, { status })}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  emptyHint: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  hintTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  hintSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  resultCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
