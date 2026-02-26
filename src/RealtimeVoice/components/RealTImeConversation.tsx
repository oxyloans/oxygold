import React, { useRef, useEffect, useState } from "react";
import { Send, Mic, Zap } from "lucide-react";
import { ChatMessage, LanguageConfig } from "../types/types";

interface ConversationScreenProps {
  selectedLanguage: LanguageConfig;
  chat: ChatMessage[];
  isAssistantSpeaking: boolean;
  onSendMessage: (message: string) => void;
}

function DynamicVideo({
  isAssistantSpeaking,
  imageUrl,
  assistantName,
}: {
  isAssistantSpeaking: boolean;
  imageUrl: string;
  assistantName: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setVideoError(false);
  };

  const handleImageError = () => {
    setVideoError(true);
    setImageLoaded(false);
    console.error("Image failed to load.");
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {!videoError ? (
        <img
          src={imageUrl}
          alt={`${assistantName} AI Voice Assistant`}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isAssistantSpeaking ? 'scale-105 brightness-110' : 'scale-100 brightness-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="text-white" size={32} />
            </div>
            <p className="text-white text-xl font-medium">{assistantName}</p>
            <p className="text-gray-300 text-sm mt-2">Ready to help you</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConversationScreen({
  selectedLanguage,
  chat,
  isAssistantSpeaking,
  onSendMessage,
}: ConversationScreenProps) {
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-10 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Animated Lines */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="w-full h-px bg-cyan-400 animate-pulse absolute top-1/4"></div>
        <div
          className="w-full h-px bg-purple-400 animate-pulse absolute top-2/4"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="w-full h-px bg-pink-400 animate-pulse absolute top-3/4"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 flex h-screen pt-20">
        {/* Video Section - Fixed width and height */}
        <div className="w-2/5 p-6 flex items-center justify-center">
          <div className="w-full h-96 flex items-center justify-center">
            <DynamicVideo 
              isAssistantSpeaking={isAssistantSpeaking} 
              imageUrl={selectedLanguage.imageUrl}
              assistantName={selectedLanguage.assistantName}
            />
          </div>
        </div>

        <div className="w-3/5 flex flex-col h-full">
          <div className="px-3 py-2 border-b border-cyan-500/20 flex-shrink-0 mt-8">
            <h3 className="text-sm font-medium text-cyan-400">
              {selectedLanguage.code === "ben" && "বেঙ্গলি কথোপকথন"}
              {selectedLanguage.code === "en" && "English Conversation"}
              {selectedLanguage.code === "hi" && "हिन्दी बातचीत"}
            </h3>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {chat.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="text-white" size={24} />
                  </div>
                  <p className="text-gray-300 text-lg">
                    {selectedLanguage.code === "ben" &&
                      "কথা বলা শুরু করুন…"}
                    {selectedLanguage.code === "en" && "Start speaking..."}
                    {selectedLanguage.code === "hi" && "बोलना शुरू करें..."}
                  </p>
                </div>
              </div>
            ) : (
              chat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl max-w-sm backdrop-blur-md border shadow-lg transform transition-all duration-300 hover:scale-105 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white border-blue-400/30 rounded-br-sm"
                        : "bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border-purple-400/30 rounded-bl-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          msg.role === "user" ? "bg-white/20" : "bg-black/20"
                        }`}
                      >
                        {msg.role === "user" ? "👤" : "🤖"}
                      </div>
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">
                          {msg.text}
                        </p>
                        <span className="text-xs text-white/70 mt-2 block">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Text Input - Fixed at bottom */}
          <div className="p-4 border-t border-cyan-500/20 flex-shrink-0">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-800/50 backdrop-blur-md border border-cyan-500/30 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder={
                  selectedLanguage.code === "ben"
                    ? "আপনার বার্তা এখানে লিখুন…"
                    : selectedLanguage.code === "hi"
                    ? "अपना संदेश यहाँ टाइप करें..."
                    : "Type your message here..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105"
              >
                <Send size={16} />
                <span className="font-semibold">
                  {selectedLanguage.code === "ben" && "পাঠানো"}
                  {selectedLanguage.code === "en" && "Send"}
                  {selectedLanguage.code === "hi" && "भेजें"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}