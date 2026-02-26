import { Zap, StopCircle, Mic } from "lucide-react";
import { LanguageConfig } from "../types/types";

interface HeaderProps {
  selectedLanguage: LanguageConfig | null;
  isSessionActive: boolean;
  isConnecting: boolean;
  onBackClick: () => void;
  onStartSession: () => void;
  onStopSession: () => void;
  currentScreen: "welcome" | "start" | "conversation";
  hideButtons?: boolean;
}

export default function Header({
  selectedLanguage,
  isSessionActive,
  isConnecting,
  onBackClick,
  onStartSession,
  onStopSession,
  currentScreen,
  hideButtons,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-cyan-900/30 to-purple-900/30 backdrop-blur-xl border-b border-cyan-500/30"></div>
      <div className="relative flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from--400 to-purple-600 flex items-center justify-center animate-pulse">
            <Zap size={18} className="text-yellow-500 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 via-yellow-500 to-red-500 bg-clip-text text-transparent">
              OXYGOLD.AI
            </h1>
            {!hideButtons && (
              <p className="text-cyan-300 text-xs sm:text-sm tracking-wider">
                {selectedLanguage
                  ? `${selectedLanguage.nativeName} ASSISTANT`
                  : "MULTILANGUAGE VOICE ASSISTANT"}
              </p>
            )}
            {hideButtons && (
              <p className="text-white text-xs sm:text-sm tracking-wider">
                MULTILANGUAGE VOICE ASSISTANT
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* {currentScreen === 'start' && (
            <button
              onClick={onBackClick}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-sm"
            >
              Back
            </button>
          )} */}

          {!hideButtons && currentScreen === "start" && (
            <button
              onClick={onStartSession}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="font-semibold">Starting...</span>
                </>
              ) : (
                <>
                  <Mic size={20} />
                  <span className="font-semibold">Start</span>
                </>
              )}
            </button>
          )}

          {!hideButtons && currentScreen === "conversation" && (
            <button
              onClick={onStopSession}
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 text-sm sm:text-base"
            >
              <StopCircle size={20} />
              <span className="font-semibold">Stop</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
