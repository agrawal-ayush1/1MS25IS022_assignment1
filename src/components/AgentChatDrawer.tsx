import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, ResearchProjectConfig, EvidenceMatrixEntry } from '../types/research';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ResearchProjectConfig;
  currentStage: number;
  evidenceMatrix: EvidenceMatrixEntry[];
  onApplyTopicFromChat?: (topic: string) => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  project,
  currentStage,
  evidenceMatrix,
  onApplyTopicFromChat,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'agent',
      content: `Welcome! I am your **AI Research Paper Agent**, specializing in systematic literature reviews, evidence synthesis, research gap identification, and structured academic writing.

To begin our systematic 10-stage workflow, **what is your research topic or central scientific question?**

Please also share any essential requirements you have in mind:
1. **Primary Research Objective** or hypothesis
2. **Academic Level** (e.g., Graduate / Master's, PhD Candidate, Faculty)
3. **Citation Style** (e.g., IEEE, APA 7th, ACM, Nature)
4. **Target Word Count** (e.g., 3,500 words)

If you don't have these finalized yet, just share your initial idea or click one of the quick suggestions below, and we will refine the scope together!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 1,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: currentStage,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          currentStage: `Stage ${currentStage}`,
          currentTopic: project.topic,
          evidenceMatrix,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to get agent response');

      const agentReply: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: currentStage,
      };

      setMessages((prev) => [...prev, agentReply]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'agent',
        content: `Error consulting agent: ${err.message || 'Please check connection'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: currentStage,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col no-print animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>AI Research Paper Agent</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Stage {currentStage} Active • Academic Assistance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-indigo-600/30 border border-indigo-500/30 text-indigo-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              {/* Parse simple markdown lines */}
              <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-500 block text-right">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 flex items-center gap-2 text-slate-400">
              <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>Agent formulating scholarly response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips including learned behavioral examples */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex gap-1.5 no-scrollbar">
        {[
          'Write a research paper on AI in healthcare.',
          'Write a literature review on fake review detection.',
          'Add references to my research paper.',
          'Help me formulate 3 focused research questions',
          'Suggest Boolean queries for my topic',
          'Explain trade-offs in our evidence matrix',
          'Identify literature-grounded research gaps',
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask agent, refine topic, or critique..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
