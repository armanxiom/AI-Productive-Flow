import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Tag, Task } from "@/lib/types";
import { formatDueDate, truncate } from "@/lib/utils";
import { TagBadge } from "./TagBadge";

const STATUS_COLORS: Record<Task["status"], string> = {
  todo: "#9E9E9E",
  "in-progress": "#F59E0B",
  done: "#10B981",
};

const STATUS_LABELS: Record<Task["status"], string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

interface TaskCardProps {
  task: Task;
  tags: Tag[];
  onPress?: () => void;
  onStatusChange?: (status: Task["status"]) => void;
  onDelete?: () => void;
}

export function TaskCard({ task, tags, onPress, onStatusChange, onDelete }: TaskCardProps) {
  const colors = useColors();
  const taskTags = tags.filter((t) => task.tags.includes(t.id));
  const statusColor = STATUS_COLORS[task.status];

  const cycleStatus = () => {
    if (!onStatusChange) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next: Record<Task["status"], Task["status"]> = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    };
    onStatusChange(next[task.status]);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <TouchableOpacity onPress={cycleStatus} hitSlop={8} activeOpacity={0.7}>
          <View
            style={[
              styles.statusDot,
              { borderColor: statusColor, backgroundColor: task.status === "done" ? statusColor : "transparent" },
            ]}
          >
            {task.status === "done" ? (
              <Feather name="check" size={10} color="#fff" />
            ) : null}
          </View>
        </TouchableOpacity>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: task.status === "done" ? colors.mutedForeground : colors.foreground,
                textDecorationLine: task.status === "done" ? "line-through" : "none",
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
              {truncate(task.description, 60)}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {STATUS_LABELS[task.status]}
              </Text>
            </View>
            {task.dueDate ? (
              <View style={styles.dueRow}>
                <Feather name="calendar" size={11} color={colors.mutedForeground} />
                <Text style={[styles.due, { color: colors.mutedForeground }]}>
                  {formatDueDate(task.dueDate)}
                </Text>
              </View>
            ) : null}
            {taskTags.slice(0, 1).map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} small />
            ))}
          </View>
        </View>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} hitSlop={8} activeOpacity={0.7}>
            <Feather name="trash-2" size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  desc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  due: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
