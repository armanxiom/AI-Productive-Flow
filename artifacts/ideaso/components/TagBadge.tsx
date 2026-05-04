import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TagBadgeProps {
  name: string;
  color: string;
  small?: boolean;
}

export function TagBadge({ name, color, small = false }: TagBadgeProps) {
  return (
    <View style={[styles.badge, small && styles.badgeSmall, { backgroundColor: color + "22" }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, small && styles.textSmall, { color }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  textSmall: {
    fontSize: 10,
  },
});
