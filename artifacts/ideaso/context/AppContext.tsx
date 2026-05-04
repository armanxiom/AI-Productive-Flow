import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Note, Tag, Task } from "@/lib/types";
import * as Storage from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { TAG_COLORS as TC } from "@/constants/colors";
import { syncToServer, fetchFromServer } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type CreateNote = Omit<Note, "id" | "createdAt" | "updatedAt">;
type CreateTask = Omit<Task, "id" | "createdAt" | "updatedAt">;
type CreateTag = Omit<Tag, "id">;

interface AppContextType {
  notes: Note[];
  tasks: Task[];
  tags: Tag[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  addNote: (note: CreateNote) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addTask: (task: CreateTask) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTag: (tag: CreateTag) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  syncNow: () => Promise<void>;
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
        "Capture ideas, organize knowledge, and manage your tasks — all in one place. Everything works offline and syncs when you're connected.\n\nTry the AI panel by tapping ⚡ in the note editor — it has 10 different AI actions to help you write, organize, and think.",
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
    {
      id: generateId(),
      title: "Project notes",
      content:
        "Meeting with team on Thursday. Need to prepare:\n- Demo of the new feature\n- Q3 roadmap review\n- Budget discussion\n\nTry the 'Meeting Notes' AI action to format this properly!",
      tags: [tags[1].id],
      isFavorite: false,
      isPinned: false,
      isInbox: false,
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
    {
      id: generateId(),
      title: "Log in to sync across devices",
      description: "Tap your profile in Settings to enable cloud sync.",
      status: "todo",
      tags: [tags[2].id],
      createdAt: now,
      updatedAt: now,
    },
  ];
  return { notes, tasks, tags };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const notesRef = useRef<Note[]>([]);
  const tasksRef = useRef<Task[]>([]);
  const tagsRef = useRef<Tag[]>([]);

  notesRef.current = notes;
  tasksRef.current = tasks;
  tagsRef.current = tags;

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

  const syncNow = useCallback(async () => {
    if (!isAuthenticated || isSyncing) return;
    setIsSyncing(true);
    try {
      const serverData = await fetchFromServer();
      if (serverData && serverData.syncedAt) {
        const serverTime = new Date(serverData.syncedAt).getTime();
        const localNotes = notesRef.current;
        const localTasks = tasksRef.current;
        const localTags = tagsRef.current;
        const hasLocalData = localNotes.length > 0 || localTasks.length > 0;
        if (!hasLocalData && (serverData.notes.length > 0 || serverData.tasks.length > 0)) {
          setNotes(serverData.notes);
          setTasks(serverData.tasks);
          setTags(serverData.tags);
          await Storage.saveNotes(serverData.notes);
          await Storage.saveTasks(serverData.tasks);
          await Storage.saveTags(serverData.tags);
        } else {
          const mostRecentLocal = Math.max(
            ...localNotes.map((n) => new Date(n.updatedAt).getTime()),
            ...localTasks.map((t) => new Date(t.updatedAt).getTime()),
            0,
          );
          if (mostRecentLocal > serverTime) {
            await syncToServer({ notes: localNotes, tasks: localTasks, tags: localTags });
          } else if (serverData.notes.length > localNotes.length) {
            setNotes(serverData.notes);
            setTasks(serverData.tasks);
            setTags(serverData.tags);
            await Storage.saveNotes(serverData.notes);
            await Storage.saveTasks(serverData.tasks);
            await Storage.saveTags(serverData.tags);
          } else {
            await syncToServer({ notes: localNotes, tasks: localTasks, tags: localTags });
          }
        }
        setLastSyncedAt(new Date().toISOString());
      } else {
        await syncToServer({
          notes: notesRef.current,
          tasks: tasksRef.current,
          tags: tagsRef.current,
        });
        setLastSyncedAt(new Date().toISOString());
      }
    } catch {
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, isSyncing]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && !isLoading) {
      syncNow();
    }
  }, [isAuthenticated, authLoading, isLoading]);

  const pushToServer = useCallback(
    (n: Note[], t: Task[], tg: Tag[]) => {
      if (isAuthenticated) {
        syncToServer({ notes: n, tasks: t, tags: tg }).catch(() => {});
      }
    },
    [isAuthenticated],
  );

  const addNote = useCallback(
    async (partial: CreateNote): Promise<Note> => {
      const now = new Date().toISOString();
      const note: Note = { ...partial, id: generateId(), createdAt: now, updatedAt: now };
      setNotes((prev) => {
        const next = [note, ...prev];
        Storage.saveNotes(next);
        pushToServer(next, tasksRef.current, tagsRef.current);
        return next;
      });
      return note;
    },
    [pushToServer],
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      setNotes((prev) => {
        const next = prev.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
        );
        Storage.saveNotes(next);
        pushToServer(next, tasksRef.current, tagsRef.current);
        return next;
      });
    },
    [pushToServer],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        Storage.saveNotes(next);
        pushToServer(next, tasksRef.current, tagsRef.current);
        return next;
      });
    },
    [pushToServer],
  );

  const addTask = useCallback(
    async (partial: CreateTask): Promise<Task> => {
      const now = new Date().toISOString();
      const task: Task = { ...partial, id: generateId(), createdAt: now, updatedAt: now };
      setTasks((prev) => {
        const next = [task, ...prev];
        Storage.saveTasks(next);
        pushToServer(notesRef.current, next, tagsRef.current);
        return next;
      });
      return task;
    },
    [pushToServer],
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setTasks((prev) => {
        const next = prev.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
        );
        Storage.saveTasks(next);
        pushToServer(notesRef.current, next, tagsRef.current);
        return next;
      });
    },
    [pushToServer],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id);
        Storage.saveTasks(next);
        pushToServer(notesRef.current, next, tagsRef.current);
        return next;
      });
    },
    [pushToServer],
  );

  const addTag = useCallback(
    async (partial: CreateTag): Promise<Tag> => {
      const tag: Tag = { ...partial, id: generateId() };
      setTags((prev) => {
        const next = [...prev, tag];
        Storage.saveTags(next);
        pushToServer(notesRef.current, tasksRef.current, next);
        return next;
      });
      return tag;
    },
    [pushToServer],
  );

  const deleteTag = useCallback(
    async (id: string) => {
      setTags((prev) => {
        const next = prev.filter((t) => t.id !== id);
        Storage.saveTags(next);
        pushToServer(notesRef.current, tasksRef.current, next);
        return next;
      });
    },
    [pushToServer],
  );

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
        isSyncing,
        lastSyncedAt,
        addNote,
        updateNote,
        deleteNote,
        addTask,
        updateTask,
        deleteTask,
        addTag,
        deleteTag,
        clearAllData,
        syncNow,
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
