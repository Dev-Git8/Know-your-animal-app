import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { useChatHistory } from "@/hooks/useChatHistory";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/animal-chat`;

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuestion = location.state?.question || "";

  const {
    conversations,
    activeId,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
    getMessages,
  } = useChatHistory();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const hasSentInitial = useRef(false);
  const activeIdRef = useRef(activeId);

  // Keep ref in sync
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when switching conversations
  useEffect(() => {
    if (activeId) {
      setMessages(getMessages(activeId));
    } else {
      setMessages([]);
    }
  }, [activeId, getMessages]);

  // Handle initial question from homepage
  useEffect(() => {
    if (initialQuestion && !hasSentInitial.current) {
      hasSentInitial.current = true;
      handleNewChat();
      sendMessage(initialQuestion, true);
    }
  }, [initialQuestion]);

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setInput("");
  };

  const handleSelectChat = (id) => {
    setActiveId(id);
  };

  const sendMessage = async (text, isInitial = false) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");

    const userMsg = { role: "user", content: msg };
    const newMessages = [...(isInitial ? [] : messages), userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Create or update conversation
    let convId = isInitial ? null : activeIdRef.current;
    if (!convId) {
      convId = createConversation(newMessages);
    } else {
      updateConversation(convId, newMessages);
    }

    let assistantSoFar = "";
    const upsertAssistant = (chunk) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      upsertAssistant("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
      // Save final messages
      setMessages((final) => {
        if (convId) updateConversation(convId, final);
        return final;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen h-screen bg-background text-foreground flex relative">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectChat}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border px-4 py-3 flex items-center gap-4 bg-card">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Animal Health AI
              </h1>
              <p className="text-xs text-muted-foreground">Ask anything about animal care</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  How can I help?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Ask me about animal diseases, treatments, symptoms, and general care tips.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:text-primary [&_li]:text-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mt-1">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted border border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); sendMessage(); }}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
