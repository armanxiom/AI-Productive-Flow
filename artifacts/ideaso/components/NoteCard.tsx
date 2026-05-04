import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Note, Tag } from "@/lib/types";
import { formatDate, stripMarkdown, truncate } from "@/lib/utils";
import { TagBadge } from "./TagBadge";

interface NoteCardProps {
  note: Note;
  tags: Tag[];
  onPress: () => void;
  onFavoriteToggle?: () => void;
  compact?: boolean;
}

export function NoteCard({ note, tags, onPress, onFavoriteToggle, compact = false }: NoteCardProps) {
  const colors = useColors();
  const noteTags = tags.filter((t) => note.tags.includes(t.id));
  const preview = truncate(stripMarkdown(note.content), compact ? 60 : 100);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        compact && styles.cardCompact,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {note.title || "Untitled"}
        </Text>
        {onFavoriteToggle ? (
          <TouchableOpacity onPress={onFavoriteToggle} hitSlop={8} activeOpacity={0.7}>
            <Feather
              name={note.isFavorite ? "star" : "star"}
              size={16}
              color={note.isFavorite ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {preview ? (
        <Text
          style={[styles.preview, { color: colors.mutedForeground }]}
          numberOfLines={compact ? 1 : 2}
        >
          {preview}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <View style={styles.tagRow}>
          {noteTags.slice(0, 2).map((tag) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} small />
          ))}
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {formatDate(note.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  cardCompact: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  preview: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tagRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
