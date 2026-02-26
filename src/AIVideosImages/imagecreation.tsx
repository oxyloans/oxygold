import React, {
  useState,
  useRef,
  useEffect,
  memo,
  type ComponentPropsWithoutRef,
  type DetailedHTMLProps,
  type AnchorHTMLAttributes,
  type ImgHTMLAttributes,
} from "react";
import axios from "axios";
import { notification } from "antd";
import {
  Image,
  Send,
  Loader2,
  ArrowLeft,
  Sparkles,
  Plus,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import OxyGoldLogo from "../assets/oxygoldlogo.png";

// ─────────────────────────────────────────────
// MarkdownRenderer (inline)
// ─────────────────────────────────────────────
interface MarkdownProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownProps> = memo(
  ({ content, className = "" }) => {
    const CodeBlock = ({
      inline,
      className,
      children,
      ...props
    }: ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
      const preRef = useRef<HTMLPreElement>(null);
      const BASE_URL = "https://meta.oxyloans.com/api";
      return inline ? (
        <code className="rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-300 px-1 py-0.5 text-sm font-mono">
          {children}
        </code>
      ) : (
        <div className="relative group my-4">
          <pre
            ref={preRef}
            className="bg-[#f9f9f9] dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 px-4 py-3 rounded-xl shadow-sm overflow-x-auto text-sm font-mono whitespace-pre-wrap"
          >
            <code {...props} className="break-words">
              {children}
            </code>
          </pre>
        </div>
      );
    };

    const LinkRenderer = ({
      href,
      children,
      ...rest
    }: DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >) => {
      const isExternal = href?.startsWith("http");
      const isYouTube =
        href?.includes("youtube.com/watch") || href?.includes("youtu.be");

      if (isYouTube && href) {
        const videoId = href.split("v=")[1] || href.split("/").pop();
        return (
          <div className="my-4 flex justify-center">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full max-w-xl aspect-video rounded-xl shadow-md"
              style={{ maxHeight: "360px" }}
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          {...rest}
        >
          {children}
          {isExternal && <span className="ml-1 text-xs">↗</span>}
        </a>
      );
    };

    const ImageRenderer = ({
      src,
      alt,
    }: ImgHTMLAttributes<HTMLImageElement>) => (
      <div className="my-4 relative group flex justify-center">
        <img
          src={src || ""}
          alt={alt || ""}
          className="max-w-full h-auto rounded-lg border shadow-md dark:border-gray-700 max-h-96 object-contain"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (src) {
              const a = document.createElement("a");
              a.href = src;
              a.download = alt || "downloaded-image.png";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
          title="Download image"
        >
          <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    );

    return (
      <div
        className={`prose prose-sm sm:prose-base max-w-full dark:prose-invert break-words text-gray-800 dark:text-gray-100 ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mt-10 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-semibold mt-5 mb-2">{children}</h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-base font-semibold mt-4 mb-1">{children}</h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-sm font-medium mt-3 mb-1 text-gray-500 dark:text-gray-400">
                {children}
              </h6>
            ),
            p: ({ children }) => (
              <p className="leading-relaxed text-[16px] text-gray-800 dark:text-gray-200 mb-4">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            del: ({ children }) => (
              <del className="line-through">{children}</del>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800/30 p-4 my-4 italic text-gray-700 dark:text-gray-300 rounded-r-md">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc ml-4 space-y-1 text-gray-800 dark:text-gray-200">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal ml-4 space-y-1 text-gray-800 dark:text-gray-200">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed text-gray-800 dark:text-gray-200 pl-2">
                {children}
              </li>
            ),
            code: CodeBlock,
            a: LinkRenderer,
            img: ImageRenderer,
            details: ({ children }) => (
              <details className="my-4 rounded-md bg-gray-100 dark:bg-gray-800 p-3">
                {children}
              </details>
            ),
            summary: ({ children }) => (
              <summary className="font-semibold cursor-pointer text-blue-600 dark:text-blue-400">
                {children}
              </summary>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white dark:bg-gray-800/50">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 font-medium border-r border-gray-200 dark:border-gray-700 text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-700">
                {children}
              </td>
            ),
            input: ({ type, checked, ...props }) =>
              type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="mr-2 text-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded"
                  {...props}
                />
              ) : (
                <input type={type} {...props} />
              ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  },
);

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  isCreating?: boolean;
  isImage?: boolean;
  isText?: boolean;
}

// ─────────────────────────────────────────────
// Helper: detect if response is an image URL
// ─────────────────────────────────────────────
const detectIsImageUrl = (value: string): boolean => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("data:image")) return true;
  try {
    const url = new URL(trimmed);
    return /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(url.pathname);
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const ImageCreation: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const loadingIntervalRef = useRef<number | null>(null);

  const LOADING_MESSAGES = [
    "Analyzing your prompt…",
    "Generating response…",
    "Working on it…",
    "Almost there…",
    "Crafting your result…",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (loading) {
      loadingIntervalRef.current = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      setLoadingTextIndex(0);
    }
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [loading]);

  const createImage = async (
    prompt: string,
    messageHistory: { role: string; content: string; isImage?: boolean }[],
  ) => {
    const response = await axios.post(
      `https://meta.oxyloans.com/api/student-service/user/chat1`,
      messageHistory,
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  };
  const downloadImage = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageCreation = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userContextRaw = sessionStorage.getItem("userJewelryContext");
    let enhancedPrompt = prompt;

    if (userContextRaw) {
      const gender = userContextRaw.match(/Gender:\s*([^,]+)/)?.[1]?.trim();
      const age = userContextRaw.match(/Age:\s*([^,]+)/)?.[1]?.trim();
      const skinTone = userContextRaw
        .match(/Skin Tone:\s*([^,]+)/)?.[1]
        ?.trim();
      const event = userContextRaw.match(/Event:\s*([^,]+)/)?.[1]?.trim();

      enhancedPrompt = `
${prompt}
The user details are: ${age}, ${gender}, ${skinTone}, ${event}.
  `;
    }

    const userMessage: ChatMessage = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setCanSend(false);

    const loadingMessage: ChatMessage = {
      role: "assistant",
      content: "Processing your request…",
      isCreating: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Build history from existing messages (excluding the loading one), then add current user message
      const history = messages
        .filter((m) => !m.isCreating)
        .map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.role === "assistant" && { isImage: !!m.imageUrl }),
        }));

      const requestBody = [
        ...history,
        { role: "user", content: enhancedPrompt },
      ];

      const apiResponse = await createImage(enhancedPrompt, requestBody);

      const assistantReply =
        apiResponse?.assistant_reply ||
        apiResponse?.content ||
        apiResponse ||
        "";
      const replyText =
        typeof assistantReply === "string"
          ? assistantReply
          : JSON.stringify(assistantReply);
      const isImg = detectIsImageUrl(replyText);

      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.isCreating
            ? {
                ...msg,
                content: isImg
                  ? "🎉 Your image has been created successfully!"
                  : replyText,
                imageUrl: isImg ? replyText : undefined,
                isCreating: false,
                isText: !isImg,
              }
            : msg,
        ),
      );
    } catch {
      notification.error({
        message: "Request Failed",
        description: "Failed to process your request. Please try again.",
      });
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.isCreating
            ? {
                ...msg,
                content: "❌ Failed to process your request. Please try again.",
                isCreating: false,
              }
            : msg,
        ),
      );
    } finally {
      setCanSend(true);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading && canSend) handleImageCreation(input);
    }
  };

  const handleSend = () => {
    if (input.trim() && !loading && canSend) handleImageCreation(input);
  };

  const handleCreateNew = () => {
    setMessages([]);
    setInput("");
    setLoading(false);
    setCanSend(true);
  };

  const EXAMPLE_PROMPTS = [
    "A beautiful gold necklace with intricate floral patterns",
    "An elegant silver bracelet with diamond accents",
    "A traditional Indian bridal jewelry set with rubies",
    "A modern minimalist ring design with emerald stone",
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* ── Header ── */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ marginLeft: '-12px' }}>
              <img src={OxyGoldLogo} alt="OxyGold" className="h-10 w-auto" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Store</span>
              </button>

              {messages.length > 0 && (
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">New Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Welcome / empty state */}
          {messages.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#D4AF37' }}>
                Create Your Gold AI Image
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                Transform your ideas into stunning images using our advanced AI
                technology. Simply describe what you want to see, and we'll
                create it for you!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left group animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(26, 26, 26, 0.08)' }}>
                        <Sparkles className="w-4 h-4" style={{ color: '#1a1a1a' }} />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-snug transition-colors group-hover-text" onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                        {prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-6 pb-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div
                    className={`max-w-[95%] rounded-2xl p-5 ${
                      msg.role === "user"
                        ? "border text-gray-900 dark:text-white"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-md"
                    }`}
                    style={msg.role === "user" ? {
                      backgroundColor: 'rgba(26, 26, 26, 0.05)',
                      borderColor: 'rgba(26, 26, 26, 0.2)'
                    } : {}}
                  >
                    {/* User message — plain text */}
                    {msg.role === "user" && (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}

                    {/* Assistant — rich markdown text response */}
                    {msg.role === "assistant" && msg.isText && (
                      <MarkdownRenderer content={msg.content} />
                    )}

                    {/* Assistant — plain label above image or loading */}
                    {msg.role === "assistant" && !msg.isText && (
                      <p className="text-sm leading-relaxed mb-2">
                        {msg.content}
                      </p>
                    )}

                    {/* Loading indicator */}
                    {msg.isCreating && (
                      <div className="mt-3 p-4 rounded-xl border" style={{
                        backgroundColor: 'rgba(26, 26, 26, 0.05)',
                        borderColor: 'rgba(26, 26, 26, 0.2)'
                      }}>
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1a1a1a' }} />
                          <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                            {LOADING_MESSAGES[loadingTextIndex]}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Generated image */}
                    {msg.imageUrl && (
                      <div className="mt-4 relative max-w-2xl mx-auto">
                        <button
                          onClick={() => downloadImage(msg.imageUrl!)}
                          className="absolute top-2 right-2 z-10 p-2 bg-black/50 text-white hover:bg-black/70 rounded-lg transition-all"
                          title="Download image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <img
                          src={msg.imageUrl}
                          alt="Generated"
                          className="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-2xl"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const errorDiv = document.createElement("div");
                            errorDiv.className =
                              "p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm";
                            errorDiv.textContent = "Failed to load image.";
                            target.parentNode?.insertBefore(
                              errorDiv,
                              target.nextSibling,
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-3 shadow-2xl flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg focus-within:ring-2 transition-all" style={{ '--tw-ring-color': '#1a1a1a' } as React.CSSProperties}>
            <div className="flex items-center gap-2 p-2">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    loading
                      ? "Processing…"
                      : "Describe the image you want to create, or ask anything…"
                  }
                  disabled={loading}
                  rows={1}
                  className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none text-sm py-1"
                  style={{
                    minHeight: "16px",
                    maxHeight: "60px",
                    lineHeight: "1.2",
                  }}
                  onInput={(e) => {
                    const target = e.currentTarget;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(target.scrollHeight, 60)}px`;
                  }}
                />
              </div>

              {canSend && (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ background: '#1a1a1a' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#000000'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span className="font-bold">Note:</span> AI images and responses may
            not always be accurate or match your prompt and context.
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in  { animation: fade-in  0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; animation-fill-mode: both; }
      `}</style>
    </div>
  );
};

export default ImageCreation;
