import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
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
import { TAG_COLORS } from "@/constants/colors";
import { generateId } from "@/lib/utils";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, tasks, tags, addTag, deleteTag, clearAllData } = useApp();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [showNewTag, setShowNewTag] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const handleExport = async () => {
    const data = JSON.stringify({ notes, tasks, tags }, null, 2);
    await Share.share({ message: data, title: "Ideaso Export" });
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all notes, tasks, and tags. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            router.back();
          },
        },
      ]
    );
  };

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    await addTag({ name, color: newTagColor });
    setNewTagName("");
    setShowNewTag(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>WORKSPACE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{notes.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Notes</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: "#F59E0B" }]}>{tasks.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tasks</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: "#10B981" }]}>{tags.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tags</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TAGS</Text>
            <TouchableOpacity onPress={() => setShowNewTag((v) => !v)} hitSlop={8}>
              <Feather name={showNewTag ? "x" : "plus"} size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {showNewTag ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary, borderRadius: colors.radius }]}>
              <TextInput
                style={[styles.tagInput, { color: colors.foreground, borderBottomColor: colors.border }]}
                placeholder="Tag name..."
                placeholderTextColor={colors.mutedForeground}
                value={newTagName}
                onChangeText={setNewTagName}
                autoFocus
              />
              <View style={styles.colorPicker}>
                {TAG_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      newTagColor === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setNewTagColor(c)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={[styles.addTagBtn, { backgroundColor: colors.primary, borderRadius: 10 }]}
                onPress={handleAddTag}
                activeOpacity={0.8}
              >
                <Text style={styles.addTagBtnText}>Add Tag</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {tags.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No tags yet. Add one above.
              </Text>
            ) : (
              tags.map((tag, i) => (
                <View key={tag.id}>
                  {i > 0 ? <View style={[styles.itemDivider, { backgroundColor: colors.border }]} /> : null}
                  <View style={styles.tagRow}>
                    <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
                    <Text style={[styles.tagName, { color: colors.foreground }]}>{tag.name}</Text>
                    <TouchableOpacity
                      onPress={() => deleteTag(tag.id)}
                      hitSlop={10}
                      activeOpacity={0.7}
                    >
                      <Feather name="trash-2" size={15} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Export */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DATA</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <TouchableOpacity style={styles.menuRow} onPress={handleExport} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="download" size={16} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.foreground }]}>Export All Data</Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>
                  Share as JSON
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleClearData}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.destructive + "18" }]}>
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.destructive }]}>Clear All Data</Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>
                  Permanently delete everything
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.aboutRow}>
              <View style={[styles.appIconBox, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="zap" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.appName, { color: colors.foreground }]}>Ideaso</Text>
                <Text style={[styles.appVersion, { color: colors.mutedForeground }]}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <Text style={[styles.aboutDesc, { color: colors.mutedForeground }]}>
              Capture ideas, organize knowledge, manage tasks. Offline-first, AI-native productivity.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24 },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: { borderWidth: 1, overflow: "hidden" },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  statDivider: { width: 1, height: 36 },
  tagInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 14,
    borderBottomWidth: 1,
  },
  colorPicker: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  addTagBtn: {
    margin: 14,
    marginTop: 0,
    padding: 12,
    alignItems: "center",
  },
  addTagBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    padding: 16,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  tagColorDot: { width: 10, height: 10, borderRadius: 5 },
  tagName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  itemDivider: { height: 1 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  aboutRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  appIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  appVersion: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  aboutDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
