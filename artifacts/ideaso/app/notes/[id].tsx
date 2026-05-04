import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AIPanel } from "@/components/AIPanel";
import { TagBadge } from "@/components/TagBadge";
import { formatDate } from "@/lib/utils";

export default function NoteEditorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, tags, updateNote, deleteNote } = useApp();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [showAI, setShowAI] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const save = useCallback(
    (t: string, c: string) => {
      if (!id) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(id, { title: t, content: c });
      }, 600);
    },
    [id, updateNote]
  );

  const handleTitleChange = (t: string) => {
    setTitle(t);
    save(t, content);
  };

  const handleContentChange = (c: string) => {
    setContent(c);
    save(title, c);
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (id) await deleteNote(id);
          router.back();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  const handleToggleFavorite = async () => {
    if (!note || !id) return;
    await updateNote(id, { isFavorite: !note.isFavorite });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleTag = async (tagId: string) => {
    if (!note || !id) return;
    const newTags = note.tags.includes(tagId)
      ? note.tags.filter((t) => t !== tagId)
      : [...note.tags, tagId];
    await updateNote(id, { tags: newTags });
  };

  const handleApplyAI = (result: string) => {
    setContent(result);
    save(title, result);
  };

  // Flush save on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        if (id) updateNote(id, { title, content });
      }
    };
  }, []);

  if (!note) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Note not found.</Text>
      </View>
    );
  }

  const noteTags = tags.filter((t) => note.tags.includes(t.id));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Toolbar */}
      <View
        style={[
          styles.toolbar,
          { paddingTop: topPad + 8, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Feather
              name="star"
              size={20}
              color={note.isFavorite ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTagPicker((v) => !v)}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Feather name="tag" size={20} color={showTagPicker ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowAI(true)}
            hitSlop={10}
            activeOpacity={0.7}
            style={[styles.aiBtn, { backgroundColor: colors.primary + "22" }]}
          >
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={[styles.aiBtnText, { color: colors.primary }]}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={10} activeOpacity={0.7}>
            <Feather name="trash-2" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tag picker */}
      {showTagPicker && tags.length > 0 ? (
        <View style={[styles.tagPicker, { backgroundColor: colors.elevated, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => handleToggleTag(tag.id)}
                activeOpacity={0.8}
                style={[
                  styles.tagOption,
                  {
                    backgroundColor: note.tags.includes(tag.id) ? tag.color + "30" : colors.card,
                    borderColor: note.tags.includes(tag.id) ? tag.color : colors.border,
                  },
                ]}
              >
                <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                <Text style={[styles.tagOptionText, { color: note.tags.includes(tag.id) ? tag.color : colors.mutedForeground }]}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Editor */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.editorContent}
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Tags row */}
        {noteTags.length > 0 ? (
          <View style={styles.tagsRow}>
            {noteTags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} small />
            ))}
          </View>
        ) : null}

        {/* Title */}
        <TextInput
          style={[styles.titleInput, { color: colors.foreground }]}
          placeholder="Note title..."
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={handleTitleChange}
          multiline
          returnKeyType="next"
        />

        {/* Meta */}
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {formatDate(note.updatedAt)} · {content.length} chars
        </Text>

        {/* Content */}
        <TextInput
          style={[styles.contentInput, { color: colors.foreground }]}
          placeholder="Start writing..."
          placeholderTextColor={colors.mutedForeground}
          value={content}
          onChangeText={handleContentChange}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
        />
      </ScrollView>

      {/* AI Panel */}
      <AIPanel
        visible={showAI}
        content={content}
        onClose={() => setShowAI(false)}
        onApply={handleApplyAI}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiBtnText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  tagPicker: {
    borderBottomWidth: 1,
  },
  tagOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagOptionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  scroll: { flex: 1 },
  editorContent: { padding: 20, paddingBottom: 80 },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    lineHeight: 34,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  contentInput: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    minHeight: 300,
  },
});
