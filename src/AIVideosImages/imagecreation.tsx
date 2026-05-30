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
import { API_BASE_URL } from "../Config";

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
      const BASE_URL = API_BASE_URL + "/oxygold-api";
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
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const hasCheckedRef = useRef(false);
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

  // Auto-generate image on component mount if context exists
  useEffect(() => {
    // Prevent multiple executions
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const userContextRaw = sessionStorage.getItem("userJewelryContext");
    if (!userContextRaw) return;

    // Validate that all required fields are present and non-empty
    const gender = userContextRaw.match(/Gender:\s*([^,]+)/)?.[1]?.trim();
    const age = userContextRaw.match(/Age:\s*([^,]+)/)?.[1]?.trim();
    const skinTone = userContextRaw.match(/Skin Tone:\s*([^,]+)/)?.[1]?.trim();
    const event = userContextRaw.match(/Event:\s*([^,]+)/)?.[1]?.trim();

    // Only auto-generate if ALL fields are present, valid, and not empty
    if (gender && age && skinTone && event && 
        gender !== '' && age !== '' && skinTone !== '' && event !== '') {
      setHasAutoGenerated(true);
      setIsAutoGenerating(true);
      handleImageCreation("Create a beautiful jewelry design for me");
    }
  }, []);

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
      `${API_BASE_URL}/student-service/user/chat1`,
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
    if (!prompt.trim() || loading) return;

    setIsAutoGenerating(false);

    const userContextRaw = sessionStorage.getItem("userJewelryContext");
    let enhancedPrompt = prompt;

    if (userContextRaw) {
      const gender = userContextRaw.match(/Gender:\s*([^,]+)/)?.[1]?.trim();
      const age = userContextRaw.match(/Age:\s*([^,]+)/)?.[1]?.trim();
      const skinTone = userContextRaw.match(/Skin Tone:\s*([^,]+)/)?.[1]?.trim();
      const event = userContextRaw.match(/Event:\s*([^,]+)/)?.[1]?.trim();

      let genderStyle = "";

      if (gender?.toLowerCase() === "male") {
        genderStyle = `
Masculine jewelry styling.
Use bold, thick, royal, minimal traditional men's jewelry.
Gold chain, bracelet.
Strong facial structure.
No feminine ornaments.
Avoid bridal necklace sets, long earrings, heavy makeup.
`;
      }

      if (gender?.toLowerCase() === "female") {
        genderStyle = `
Elegant feminine jewelry styling.
Detailed, decorative, graceful design.
Bridal or festive necklace set, matching earrings, bangles.
Soft features, natural makeup.
Avoid thick masculine chains or kada-style jewelry.
`;
      }

      enhancedPrompt = `
${prompt}

User Details:
Age: ${age}
Gender: ${gender}
Skin Tone: ${skinTone}
Event: ${event} 

${genderStyle}

Ultra realistic, photorealistic, 4K, high detail, professional lighting.
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

let replyText = "";
let isImg = false;

// Base64 image response
if (apiResponse?.image) {
  replyText = `data:image/png;base64,${apiResponse.image}`;
  isImg = true;
} else {
  const assistantReply =
    apiResponse?.assistant_reply ||
    apiResponse?.content ||
    apiResponse ||
    "";

  replyText =
    typeof assistantReply === "string"
      ? assistantReply
      : JSON.stringify(assistantReply);

  isImg = detectIsImageUrl(replyText);
}

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
      : msg
  )
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
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img src={OxyGoldLogo} alt="OxyGold" className="h-6 w-auto" />

            {messages.length > 0 && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Back to Store Button */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          {messages.length === 0 && !loading && (
            <div className="text-center py-20 animate-fade-in">
              <h2 className="text-5xl font-bold mb-6 text-black dark:text-white">
                Create Your AI Jewelry Image
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed">
                Transform your ideas into stunning jewelry images using advanced AI.
                Describe what you want to see, and we'll create it for you.
              </p>

              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-black dark:hover:border-white hover:shadow-lg transition-all text-left group animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-black dark:text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed transition-colors group-hover:text-black dark:group-hover:text-white">
                        {prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state for auto-generation */}
          {messages.length === 0 && loading && (
            <div className="text-center py-20 animate-fade-in">
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 animate-spin text-black dark:text-white" />
                <h2 className="text-3xl font-bold text-black dark:text-white">
                  Creating Your Personalized Jewelry Design
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md text-lg">
                  Using your preferences to generate the perfect jewelry image...
                </p>
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
                    className={`max-w-[95%] rounded-2xl p-5 ${msg.role === "user"
                      ? "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      : "bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-black dark:text-white shadow-md"
                      }`}
                  >
                    {/* User message — plain text */}
                    {msg.role === "user" && (
                      <p className="text-sm leading-relaxed text-black dark:text-white">{msg.content}</p>
                    )}

                    {/* Assistant — rich markdown text response */}
                    {msg.role === "assistant" && msg.isText && (
                      <MarkdownRenderer content={msg.content} />
                    )}

                    {/* Assistant — plain label above image or loading */}
                    {msg.role === "assistant" && !msg.isText && (
                      <p className="text-sm leading-relaxed mb-2 text-black dark:text-white">
                        {msg.content}
                      </p>
                    )}

                    {/* Loading indicator */}
                    {msg.isCreating && (
                      <div className="mt-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
                          <span className="text-sm font-semibold text-black dark:text-white">
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
                          className="absolute top-2 right-2 z-10 p-2 bg-black/70 dark:bg-white/20 text-white dark:text-gray-200 hover:bg-black/90 dark:hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm"
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

      {/* Input Area - Fixed at bottom */}
      <div className="bg-white dark:bg-gray-900 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 shadow-2xl flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all">
            <div className="flex items-center gap-2 p-2">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    loading
                      ? "Processing…"
                      : "Describe the jewelry image you want to create, or ask anything…"
                  }
                  disabled={loading}
                  rows={1}
                  className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none text-base py-2"
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
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
