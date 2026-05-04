import React, { useMemo, useState } from "react";
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
import { EmptyState } from "@/components/EmptyState";

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, tags, addNote, updateNote } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const nonInboxNotes = notes.filter((n) => !n.isInbox);

  const filtered = useMemo(() => {
    let result = nonInboxNotes;
    if (activeTag) result = result.filter((n) => n.tags.includes(activeTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return [...result].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [nonInboxNotes, activeTag, search]);

  const handleNewNote = async () => {
    const note = await addNote({
      title: "",
      content: "",
      tags: [],
      isFavorite: false,
      isPinned: false,
      isInbox: false,
    });
    router.push(`/notes/${note.id}` as any);
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
            <View style={[styles.iconBox, { backgroundColor: "#3B82F618" }]}>
              <Feather name="file-text" size={16} color="#3B82F6" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Notes</Text>
          </View>
          <TouchableOpacity
            style={[styles.newBtn, { backgroundColor: colors.primary }]}
            onPress={handleNewNote}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search notes..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tag Filter */}
        {tags.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagRow}
          >
            <TouchableOpacity
              style={[
                styles.tagChip,
                {
                  backgroundColor: !activeTag ? colors.primary : colors.card,
                  borderColor: !activeTag ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveTag(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tagChipText,
                  { color: !activeTag ? "#fff" : colors.mutedForeground },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: activeTag === tag.id ? tag.color + "22" : colors.card,
                    borderColor: activeTag === tag.id ? tag.color : colors.border,
                  },
                ]}
                onPress={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                <Text
                  style={[
                    styles.tagChipText,
                    { color: activeTag === tag.id ? tag.color : colors.mutedForeground },
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* Note Count */}
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          {filtered.length} {filtered.length === 1 ? "note" : "notes"}
        </Text>

        {/* Notes List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="file-text"
            title={search || activeTag ? "No matching notes" : "No notes yet"}
            subtitle={search || activeTag ? "Try a different search or filter" : "Create your first note"}
            actionLabel={!search && !activeTag ? "New Note" : undefined}
            onAction={handleNewNote}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((note) => (
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 14 },
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
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  tagRow: {
    gap: 8,
    paddingRight: 4,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  countText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
