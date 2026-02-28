import { useState, useCallback } from "react";

const STORAGE_KEY = "animal-chat-history";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const loadConversations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveConversations = (convs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
};

const deriveTitle = (messages) => {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Chat";
  const text = first.content.slice(0, 40);
  return text.length < first.content.length ? text + "…" : text;
};

export const useChatHistory = () => {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);

  const persist = useCallback((convs) => {
    setConversations(convs);
    saveConversations(convs);
  }, []);

  const createConversation = useCallback((initialMessages = []) => {
    const id = generateId();
    const conv = {
      id,
      title: deriveTitle(initialMessages),
      messages: initialMessages,
      updatedAt: Date.now(),
    };
    const updated = [conv, ...loadConversations()];
    persist(updated);
    setActiveId(id);
    return id;
  }, [persist]);

  const updateConversation = useCallback((id, messages) => {
    const convs = loadConversations();
    const idx = convs.findIndex((c) => c.id === id);
    if (idx === -1) return;
    convs[idx] = {
      ...convs[idx],
      messages,
      title: deriveTitle(messages),
      updatedAt: Date.now(),
    };
    // Move to top
    const [updated] = convs.splice(idx, 1);
    convs.unshift(updated);
    persist(convs);
  }, [persist]);

  const deleteConversation = useCallback((id) => {
    const convs = loadConversations().filter((c) => c.id !== id);
    persist(convs);
    if (activeId === id) setActiveId(null);
  }, [activeId, persist]);

  const getMessages = useCallback((id) => {
    const conv = loadConversations().find((c) => c.id === id);
    return conv?.messages || [];
  }, []);

  return {
    conversations,
    activeId,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
    getMessages,
  };
};
