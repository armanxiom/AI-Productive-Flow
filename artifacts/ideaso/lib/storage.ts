import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note, Task, Tag } from "./types";

const NOTES_KEY = "@ideaso/notes";
const TASKS_KEY = "@ideaso/tasks";
const TAGS_KEY = "@ideaso/tags";
const INITIALIZED_KEY = "@ideaso/initialized";

export async function getNotes(): Promise<Note[]> {
  const data = await AsyncStorage.getItem(NOTES_KEY);
  return data ? (JSON.parse(data) as Note[]) : [];
}

export async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function getTasks(): Promise<Task[]> {
  const data = await AsyncStorage.getItem(TASKS_KEY);
  return data ? (JSON.parse(data) as Task[]) : [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function getTags(): Promise<Tag[]> {
  const data = await AsyncStorage.getItem(TAGS_KEY);
  return data ? (JSON.parse(data) as Tag[]) : [];
}

export async function saveTags(tags: Tag[]): Promise<void> {
  await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export async function isInitialized(): Promise<boolean> {
  const val = await AsyncStorage.getItem(INITIALIZED_KEY);
  return val === "true";
}

export async function setInitialized(): Promise<void> {
  await AsyncStorage.setItem(INITIALIZED_KEY, "true");
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([NOTES_KEY, TASKS_KEY, TAGS_KEY, INITIALIZED_KEY]);
}
