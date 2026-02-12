import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createParser } from "eventsource-parser";
import { useState } from "react";

// Types matching the integration
export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messages?: Message[];
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
  });
}

export function useConversation(id: number | null) {
  return useQuery<Conversation>({
    queryKey: ["/api/conversations", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const [streamedContent, setStreamedContent] = useState("");

  const mutate = async ({ conversationId, content }: { conversationId: number; content: string }) => {
    setStreamedContent("");
    
    // Optimistic update for user message could go here
    
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) throw new Error("Failed to send message");

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    
    const parser = createParser({
      onEvent: (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.content) {
            setStreamedContent(prev => prev + data.content);
          }
        } catch (e) {
          console.error('Error parsing SSE', e);
        }
      }
    });

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.feed(decoder.decode(value));
      }
    } finally {
      reader.releaseLock();
      // Invalidate to fetch the full saved message from DB
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      setStreamedContent("");
    }
  };

  return {
    sendMessage: useMutation({ mutationFn: mutate }),
    streamedContent
  };
}
