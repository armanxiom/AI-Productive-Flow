import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

interface QuickCaptureProps {
  onCapture?: () => void;
}

export function QuickCapture({ onCapture }: QuickCaptureProps) {
  const colors = useColors();
  const { addNote } = useApp();
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await addNote({
      title: trimmed.split("\n")[0].slice(0, 80) || "Untitled",
      content: trimmed,
      tags: [],
      isFavorite: false,
      isPinned: false,
      isInbox: true,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setText("");
    inputRef.current?.blur();
    onCapture?.();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <Feather name="zap" size={16} color={colors.primary} style={styles.icon} />
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: colors.foreground }]}
        placeholder="Capture an idea..."
        placeholderTextColor={colors.mutedForeground}
        value={text}
        onChangeText={setText}
        multiline
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        blurOnSubmit
      />
      {text.length > 0 ? (
        <TouchableOpacity
          onPress={handleSubmit}
          hitSlop={8}
          activeOpacity={0.8}
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="arrow-up" size={14} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderWidth: 1,
    gap: 10,
    minHeight: 52,
  },
  icon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    maxHeight: 120,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
});
