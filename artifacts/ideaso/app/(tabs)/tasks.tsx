import React, { useState } from "react";
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
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { Task } from "@/lib/types";

type Filter = "all" | "todo" | "in-progress" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, tags, addTask, updateTask, deleteTask } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const filtered = tasks
    .filter((t) => filter === "all" || t.status === filter)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const handleAdd = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    await addTask({
      title: trimmed,
      status: "todo",
      tags: [],
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNewTitle("");
    setShowAdd(false);
  };

  const handleDelete = (task: Task) => {
    Alert.alert("Delete Task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTask(task.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
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
            <View style={[styles.iconBox, { backgroundColor: "#F59E0B18" }]}>
              <Feather name="check-square" size={16} color="#F59E0B" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Tasks</Text>
          </View>
          <TouchableOpacity
            style={[styles.newBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAdd((v) => !v)}
            activeOpacity={0.8}
          >
            <Feather name={showAdd ? "x" : "plus"} size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress summary */}
        <View style={[styles.progressBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.progressRow}>
            <View style={styles.progressStat}>
              <Text style={[styles.progressNum, { color: colors.mutedForeground }]}>{todoCount}</Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>To Do</Text>
            </View>
            <View style={[styles.progressDivider, { backgroundColor: colors.border }]} />
            <View style={styles.progressStat}>
              <Text style={[styles.progressNum, { color: "#F59E0B" }]}>{inProgressCount}</Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Active</Text>
            </View>
            <View style={[styles.progressDivider, { backgroundColor: colors.border }]} />
            <View style={styles.progressStat}>
              <Text style={[styles.progressNum, { color: "#10B981" }]}>{doneCount}</Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Done</Text>
            </View>
          </View>
          {tasks.length > 0 ? (
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: "#10B981",
                    width: `${Math.round((doneCount / tasks.length) * 100)}%` as any,
                  },
                ]}
              />
            </View>
          ) : null}
        </View>

        {/* Add Task */}
        {showAdd ? (
          <View style={[styles.addBox, { backgroundColor: colors.card, borderColor: colors.primary, borderRadius: colors.radius }]}>
            <TextInput
              style={[styles.addInput, { color: colors.foreground }]}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.mutedForeground}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity
              style={[styles.addSubmit, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.id ? colors.primary : colors.card,
                  borderColor: filter === f.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, { color: filter === f.id ? "#fff" : colors.mutedForeground }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Task List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="check-square"
            title={filter === "all" ? "No tasks yet" : `No ${filter === "in-progress" ? "in-progress" : filter} tasks`}
            subtitle={filter === "all" ? "Add your first task above" : "Change the filter to see other tasks"}
            actionLabel={filter === "all" ? "Add Task" : undefined}
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tags={tags}
                onStatusChange={(status) => updateTask(task.id, { status })}
                onDelete={() => handleDelete(task)}
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
  title: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBox: { padding: 16, borderWidth: 1 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressStat: { flex: 1, alignItems: "center" },
  progressNum: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  progressDivider: { width: 1, height: 36 },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2A2A2A",
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  addBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  addInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  addSubmit: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: { gap: 8, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
