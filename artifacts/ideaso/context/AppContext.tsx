import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Note, Tag, Task } from "@/lib/types";
import * as Storage from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { TAG_COLORS as TC } from "@/constants/colors";

type CreateNote = Omit<Note, "id" | "createdAt" | "updatedAt">;
type CreateTask = Omit<Task, "id" | "createdAt" | "updatedAt">;
type CreateTag = Omit<Tag, "id">;

interface AppContextType {
  notes: Note[];
  tasks: Task[];
  tags: Tag[];
  isLoading: boolean;
  addNote: (note: CreateNote) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addTask: (task: CreateTask) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTag: (tag: CreateTag) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function seedData(): { notes: Note[]; tasks: Task[]; tags: Tag[] } {
  const now = new Date().toISOString();
  const tags: Tag[] = [
    { id: generateId(), name: "Ideas", color: TC[0] },
    { id: generateId(), name: "Work", color: TC[1] },
    { id: generateId(), name: "Personal", color: TC[2] },
  ];
  const notes: Note[] = [
    {
      id: generateId(),
      title: "Welcome to Ideaso",
      content:
        "Capture ideas, organize knowledge, and manage your tasks — all in one place. Everything works offline and syncs when you're connected.",
      tags: [tags[0].id],
      isFavorite: true,
      isPinned: true,
      isInbox: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: "Quick idea",
      content: "Build a habit tracker that syncs with my notes automatically.",
      tags: [tags[0].id],
      isFavorite: false,
      isPinned: false,
      isInbox: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
  const tasks: Task[] = [
    {
      id: generateId(),
      title: "Explore the Notes tab",
      description: "Create your first note and try AI actions on it.",
      status: "todo",
      tags: [tags[1].id],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: "Set up your workspace",
      description: "Add tags and customize your preferences in Settings.",
      status: "in-progress",
      tags: [tags[1].id],
      createdAt: now,
      updatedAt: now,
    },
  ];
  return { notes, tasks, tags };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const initialized = await Storage.isInitialized();
        if (!initialized) {
          const seed = seedData();
          await Storage.saveNotes(seed.notes);
          await Storage.saveTasks(seed.tasks);
          await Storage.saveTags(seed.tags);
          await Storage.setInitialized();
          setNotes(seed.notes);
          setTasks(seed.tasks);
          setTags(seed.tags);
        } else {
          const [loadedNotes, loadedTasks, loadedTags] = await Promise.all([
            Storage.getNotes(),
            Storage.getTasks(),
            Storage.getTags(),
          ]);
          setNotes(loadedNotes);
          setTasks(loadedTasks);
          setTags(loadedTags);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const addNote = useCallback(async (partial: CreateNote): Promise<Note> => {
    const now = new Date().toISOString();
    const note: Note = { ...partial, id: generateId(), createdAt: now, updatedAt: now };
    setNotes((prev) => {
      const next = [note, ...prev];
      Storage.saveNotes(next);
      return next;
    });
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    setNotes((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      );
      Storage.saveNotes(next);
      return next;
    });
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      Storage.saveNotes(next);
      return next;
    });
  }, []);

  const addTask = useCallback(async (partial: CreateTask): Promise<Task> => {
    const now = new Date().toISOString();
    const task: Task = { ...partial, id: generateId(), createdAt: now, updatedAt: now };
    setTasks((prev) => {
      const next = [task, ...prev];
      Storage.saveTasks(next);
      return next;
    });
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      );
      Storage.saveTasks(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      Storage.saveTasks(next);
      return next;
    });
  }, []);

  const addTag = useCallback(async (partial: CreateTag): Promise<Tag> => {
    const tag: Tag = { ...partial, id: generateId() };
    setTags((prev) => {
      const next = [...prev, tag];
      Storage.saveTags(next);
      return next;
    });
    return tag;
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    setTags((prev) => {
      const next = prev.filter((t) => t.id !== id);
      Storage.saveTags(next);
      return next;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    await Storage.clearAll();
    setNotes([]);
    setTasks([]);
    setTags([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        notes,
        tasks,
        tags,
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        addTask,
        updateTask,
        deleteTask,
        addTag,
        deleteTag,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
