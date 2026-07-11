import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Brain, Loader2 } from "lucide-react";
import { chatWithAgent } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Message {
  sender: "user" | "agent";
  text: string;
}

export const AgentChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "Hello! I am the BIDA Macro-Intelligence Agent. I have live access to our database. Ask me about the current climate score, trends, or ask me to search for recent articles on topics like RMG or FDI.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const reply = await chatWithAgent(userMessage);
      setMessages((prev) => [...prev, { sender: "agent", text: reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `⚠️ Error: ${err.message || "Failed to get a response from the agent. Please try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group"
          title="Chat with AI Agent"
        >
          <Brain className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="flex flex-col w-[360px] sm:w-[400px] h-[500px] bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground border-b border-border/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-primary-foreground/10 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide">BIDA AI Assistant</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-primary-foreground/75 font-mono uppercase">LangChain Agent Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg transition-all duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar bg-slate-950/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground border border-border/40 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 max-w-[85%] p-3 bg-muted border border-border/40 rounded-2xl rounded-tl-none shadow-sm text-sm text-muted-foreground font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Agent is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-border bg-card flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about climate score, query articles..."
              className="flex-1 bg-muted border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground transition-all duration-150"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

        </div>
      )}
    </div>
  );
};
