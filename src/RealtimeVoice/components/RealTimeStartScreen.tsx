import React from "react";
import { Play } from "lucide-react";
import { LanguageConfig } from "../types/types";


interface StartScreenProps {
  selectedLanguage: LanguageConfig;
  isConnecting: boolean;
  onStartSession: () => void;
}


export default function StartScreen({ 
  selectedLanguage, 
  isConnecting, 
  onStartSession 
}: StartScreenProps) {
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


      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 min-h-screen pt-24">
        <div className="text-center space-y-6">
          <div className="text-8xl animate-bounce">
            {selectedLanguage.flag}
          </div>
          <h2 className="text-3xl font-bold text-white">
            {selectedLanguage.code === "te" && "తెలుగు గోల్డ్ వాయిస్ అసిస్టెంట్"}
            {selectedLanguage.code === "en" && "English Voice Assistant"}
            {selectedLanguage.code === "hi" && "हिन्दी वॉयस असिस्टेंट"}
          </h2>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            {selectedLanguage.code === "te" &&
              "మీ గోల్డ్ వాయిస్ అసిస్టెంట్‌తో సంభాషణ ప్రారంభించండి"}
            {selectedLanguage.code === "en" &&
              "Start your conversation with the voice assistant"}
            {selectedLanguage.code === "hi" &&
              "अपने वॉयस असिस्टेंट के साथ बातचीत शुरू करें"}
          </p>
          <button
            onClick={onStartSession}
            disabled={isConnecting}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 transform hover:scale-105 disabled:opacity-50"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>
                  {selectedLanguage.code === "te" && "కనెక్ట్ అవుతోంది..."}
                  {selectedLanguage.code === "en" && "Connecting..."}
                  {selectedLanguage.code === "hi" && "कनेक्ट हो रहा है..."}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play size={20} />
                <span>
                  {selectedLanguage.code === "te" && "సంభాషణ ప్రారంభించండి"}
                  {selectedLanguage.code === "en" && "Start Conversation"}
                  {selectedLanguage.code === "hi" && "बातचीत शुरू करें"}
                </span>
              </div>
            )}
          </button>
        </div>
        
        <div className="mt-8 max-w-4xl w-full text-center">
          <h4 className="text-lg font-semibold text-yellow-600 mb-3">
            Disclaimer
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            OXYGOLD.AI is a real-time AI assistant. While you can select your
            preferred language above, we cannot guarantee 100% adherence to the
            selected language throughout the conversation. The AI may occasionally
            respond in English or mix languages based on context and system
            limitations.
          </p>
        </div>
      </div>
    </div>
  );
}