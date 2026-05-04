import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { callAI } from "@/lib/api";
import { AIAction } from "@/lib/types";

interface AIPanelProps {
  visible: boolean;
  content: string;
  onClose: () => void;
  onApply?: (result: string) => void;
}

const ACTIONS: {
  id: AIAction;
  label: string;
  icon: string;
  description: string;
  color?: string;
}[] = [
  { id: "summarize", label: "Summarize", icon: "align-left", description: "2-3 sentence summary" },
  { id: "cleanup", label: "Clean Up", icon: "edit-3", description: "Fix grammar & style" },
  { id: "to-tasks", label: "To Tasks", icon: "check-square", description: "Extract action items" },
  { id: "outline", label: "Outline", icon: "list", description: "Structured outline" },
  { id: "expand", label: "Expand", icon: "maximize-2", description: "Turn brief into full note" },
  { id: "key-points", label: "Key Points", icon: "target", description: "Extract core insights" },
  { id: "title", label: "Title Ideas", icon: "type", description: "3 title suggestions" },
  { id: "brainstorm", label: "Brainstorm", icon: "zap", description: "Related ideas & angles" },
  { id: "fix-grammar", label: "Fix Grammar", icon: "check-circle", description: "Spelling & punctuation" },
  { id: "meeting-notes", label: "Meeting Notes", icon: "users", description: "Format as meeting notes" },
];

export function AIPanel({ visible, content, onClose, onApply }: AIPanelProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: AIAction) => {
    if (!content.trim()) {
      Alert.alert("No content", "Write something in the note before using AI actions.");
      return;
    }
    setActiveAction(action);
    setResult("");
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await callAI(action, content);
      setResult(res);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError("AI request failed. Check your connection and try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(result);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleApply = () => {
    onApply?.(result);
    setResult("");
    setActiveAction(null);
    onClose();
  };

  const handleClose = () => {
    setResult("");
    setActiveAction(null);
    setError("");
    onClose();
  };

  const activeLabel = ACTIONS.find((a) => a.id === activeAction)?.label ?? "";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <View style={styles.topBarLeft}>
            <View style={[styles.aiDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.title, { color: colors.foreground }]}>AI Actions</Text>
          </View>
          <TouchableOpacity onPress={handleClose} hitSlop={12} activeOpacity={0.7}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.actionsGrid}>
            {ACTIONS.map((action) => {
              const isActive = activeAction === action.id;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.actionCard,
                    {
                      backgroundColor: isActive ? colors.primary + "22" : colors.card,
                      borderColor: isActive ? colors.primary : colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                  onPress={() => handleAction(action.id)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={action.icon as any}
                    size={18}
                    color={isActive ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: isActive ? colors.primary : colors.foreground },
                    ]}
                  >
                    {action.label}
                  </Text>
                  <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                Running {activeLabel}...
              </Text>
            </View>
          ) : null}

          {error ? (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: colors.destructive + "18",
                  borderColor: colors.destructive + "44",
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          {result ? (
            <View>
              <View style={[styles.resultHeader]}>
                <Feather name="cpu" size={14} color={colors.primary} />
                <Text style={[styles.resultLabel, { color: colors.primary }]}>
                  {activeLabel} result
                </Text>
              </View>
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary + "44",
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Text style={[styles.resultText, { color: colors.foreground }]}>{result}</Text>
              </View>
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[styles.resultBtn, { backgroundColor: colors.secondary, borderRadius: 12 }]}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <Feather name="copy" size={15} color={colors.foreground} />
                  <Text style={[styles.resultBtnText, { color: colors.foreground }]}>Copy</Text>
                </TouchableOpacity>
                {onApply ? (
                  <TouchableOpacity
                    style={[
                      styles.resultBtn,
                      { backgroundColor: colors.primary, borderRadius: 12, flex: 1 },
                    ]}
                    onPress={handleApply}
                    activeOpacity={0.8}
                  >
                    <Feather name="check" size={15} color="#fff" />
                    <Text style={[styles.resultBtnText, { color: "#fff" }]}>Apply to Note</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  scroll: { flex: 1, padding: 20 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  actionCard: { width: "47%", padding: 14, borderWidth: 1, gap: 6 },
  actionLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  actionDesc: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
    justifyContent: "center",
  },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  resultLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  resultBox: { padding: 16, borderWidth: 1, marginBottom: 12 },
  resultText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  errorText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  resultActions: { flexDirection: "row", gap: 10, marginBottom: 20 },
  resultBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
