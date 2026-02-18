import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { 
  InsertUser, InsertMessage, InsertPage, InsertEvent, InsertPkBattle, InsertAnnouncement,
  User, Message, Page, Event, PkBattle, Announcement, UpdateUserRequest
} from "@shared/routes";

// --- USERS ---
export function useUsers() {
  return useQuery<User[]>({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path);
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.users.create.path, {
        method: api.users.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "User created successfully" });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateUserRequest) => {
      const url = buildUrl(api.users.update.path, { id });
      const res = await fetch(url, {
        method: api.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "User updated successfully" });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.users.delete.path, { id });
      const res = await fetch(url, { method: api.users.delete.method });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "User deleted" });
    },
  });
}

// --- MESSAGES ---
export function useMessages() {
  return useQuery<Message[]>({
    queryKey: [api.messages.list.path],
    queryFn: async () => {
      const res = await fetch(api.messages.list.path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return await res.json();
    },
    refetchInterval: 3000, // Polling for now since WS isn't fully implemented in this step
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string, replyToId?: number }) => {
      const res = await fetch(api.messages.create.path, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.messages.delete.path, { id });
      const res = await fetch(url, { method: api.messages.delete.method });
      if (!res.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
      toast({ title: "Message deleted" });
    },
  });
}

// --- EVENTS ---
export function useEvents() {
  return useQuery<Event[]>({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(api.events.list.path);
      if (!res.ok) throw new Error("Failed to fetch events");
      return await res.json();
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertEvent) => {
      const res = await fetch(api.events.create.path, {
        method: api.events.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      toast({ title: "Event created" });
    },
  });
}

export function useLikeEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.events.like.path, { id });
      const res = await fetch(url, { method: api.events.like.method });
      if (!res.ok) throw new Error("Failed to like event");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
    },
  });
}

// --- PK BATTLES ---
export function usePkBattles() {
  return useQuery<PkBattle[]>({
    queryKey: [api.pkBattles.list.path],
    queryFn: async () => {
      const res = await fetch(api.pkBattles.list.path);
      if (!res.ok) throw new Error("Failed to fetch PK battles");
      return await res.json();
    },
  });
}

export function useCreatePkBattle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertPkBattle) => {
      const res = await fetch(api.pkBattles.create.path, {
        method: api.pkBattles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create PK battle");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pkBattles.list.path] });
      toast({ title: "PK Battle created" });
    },
  });
}

// --- ANNOUNCEMENTS ---
export function useAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: [api.announcements.get.path],
    queryFn: async () => {
      const res = await fetch(api.announcements.get.path);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return await res.json();
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      const res = await fetch(api.announcements.create.path, {
        method: api.announcements.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.get.path] });
      toast({ title: "Duyuru yayınlandı" });
    },
  });
}

// --- SETTINGS ---
export function useSetting(key: string) {
  return useQuery<{ value: string }>({
    queryKey: ["/api/settings", key],
    queryFn: async () => {
      const res = await fetch(`/api/settings/${key}`);
      if (!res.ok) return { value: "" };
      return await res.json();
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return await res.json();
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings", key] });
      toast({ title: "Ayar güncellendi" });
    },
  });
}

// --- PAGES ---
export function usePages() {
  return useQuery<Page[]>({
    queryKey: [api.pages.list.path],
    queryFn: async () => {
      const res = await fetch(api.pages.list.path);
      if (!res.ok) throw new Error("Failed to fetch pages");
      return await res.json();
    },
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertPage) => {
      const res = await fetch(api.pages.create.path, {
        method: api.pages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create page");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pages.list.path] });
      toast({ title: "Page created" });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.pages.delete.path, { id });
      const res = await fetch(url, { method: api.pages.delete.method });
      if (!res.ok) throw new Error("Failed to delete page");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pages.list.path] });
      toast({ title: "Page deleted" });
    },
  });
}
