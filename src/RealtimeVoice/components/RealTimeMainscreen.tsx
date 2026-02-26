import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

import RealTimeHeader from "./RealTimeHeader";
import RealTimeWelcomeScreen from "./RealTimeWellcomescreen";
import StartScreen from "./RealTimeStartScreen";
import ConversationScreen from "./RealTImeConversation";

import { useState, useEffect, useRef } from "react";
import { LanguageConfig, ChatMessage } from "../types/types";
import { voiceSessionService } from "../hooks/useMessages";
import { message } from "antd";

type Screen = "welcome" | "start" | "conversation";

const RealtimePage: React.FC = () => {
  const { screen } = useParams<{ screen?: Screen }>();
  const navigate = useNavigate();
  const location = useLocation();

  // States for language, chat etc
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageConfig | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [selectedInstructions, setSelectedInstructions] = useState<string>("");

  // Track if user is intentionally navigating
  const isIntentionalNavigation = useRef(false);

  // Default to 'welcome' if screen param is invalid or missing
  const currentScreen: Screen =
    screen === "start" || screen === "conversation" ? screen : "welcome";

  // Handle beforeunload event (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSessionActive) {
        e.preventDefault();
        e.returnValue =
          "You have an active voice session. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSessionActive]);

  // Handle browser back/forward navigation - IMMEDIATE STOP
  useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      console.log("Browser back detected, isSessionActive:", isSessionActive);

      if (isSessionActive && !isIntentionalNavigation.current) {
        console.log("Stopping session immediately on browser back");
        // Stop the session IMMEDIATELY when user navigates back
        voiceSessionService.stopSession();
        setIsSessionActive(false);
        setIsAssistantSpeaking(false);
        setChat([]);
      }
      // Reset the flag
      isIntentionalNavigation.current = false;
    };

    // Listen to popstate for browser back/forward
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [isSessionActive]);

  // Monitor current screen changes and enforce session rules
  useEffect(() => {
    console.log(
      "Screen changed to:",
      currentScreen,
      "isSessionActive:",
      isSessionActive,
      "intentional:",
      isIntentionalNavigation.current
    );

    // If we're on start screen and session was active (user pressed back from conversation)
    if (
      currentScreen === "start" &&
      isSessionActive &&
      !isIntentionalNavigation.current
    ) {
      console.log(
        "User navigated back to start screen with active session - stopping now"
      );
      voiceSessionService.stopSession();
      setIsSessionActive(false);
      setIsAssistantSpeaking(false);
      setChat([]);
    }

    // If we're on welcome screen, reset everything
    if (currentScreen === "welcome") {
      console.log("On welcome screen - resetting all states");
      if (isSessionActive && !isIntentionalNavigation.current) {
        voiceSessionService.stopSession();
      }

      setSelectedLanguage(null);
      setIsSessionActive(false);
      setIsAssistantSpeaking(false);
      setChat([]);
      setIsConnecting(false);
      setSelectedInstructions("");
    }

    // Always reset the intentional navigation flag after screen change
    setTimeout(() => {
      isIntentionalNavigation.current = false;
    }, 100);
  }, [currentScreen, isSessionActive]);

  // Navigation helpers to move between screens via URL
  const goToScreen = (newScreen: Screen) => {
    isIntentionalNavigation.current = true;
    navigate(`/voiceAssistant/${newScreen}`);
  };

  const handleLanguageSelect = (
    language: LanguageConfig,
    instructions: string
  ) => {
    setSelectedLanguage(language);
    setSelectedInstructions(instructions);
    goToScreen("start");
  };

  const handleBackToWelcome = () => {
    // Stop session before going back
    if (isSessionActive) {
      const shouldStop = window.confirm(
        "You have an active voice session. Do you want to stop it and go back?"
      );

      if (!shouldStop) {
        return; // Don't navigate if user cancels
      }

      voiceSessionService.stopSession();
      setIsSessionActive(false);
      setIsAssistantSpeaking(false);
      setChat([]);
      setSelectedLanguage(null);
      setSelectedInstructions("");
    }
    goToScreen("welcome");
  };

  const handleStartSession = async () => {
    if (!selectedLanguage) return;

    setIsConnecting(true);
    try {
      await voiceSessionService.startSession(
        "",
        selectedLanguage,
        selectedInstructions,
        (message: ChatMessage) => {
          setChat((prev) => {
            if (message.role === "assistant") {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === "assistant") {
                const updated = [...prev];
                updated[updated.length - 1] = message;
                return updated;
              }
            }
            return [...prev, message];
          });
        },
        (speaking: boolean) => {
          setIsAssistantSpeaking(speaking);
        },
        navigate,
        "shimmer"
      );

      setIsSessionActive(true);
      goToScreen("conversation");
      setChat([]);
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStopSession = () => {
    voiceSessionService.stopSession();
    setIsSessionActive(false);
    setIsAssistantSpeaking(false);
    setChat([]);
    setSelectedLanguage(null);
    setSelectedInstructions("");
    goToScreen("welcome");
  };

  const handleSendMessage = (message: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      text: message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChat((prev) => [...prev, userMessage]);
    voiceSessionService.sendMessage(message);
  };

  const renderCurrentScreen = () => {
    if (!selectedLanguage && currentScreen !== "welcome") {
      message.info("No language is selected please select any language");
      goToScreen("welcome");
    }
    switch (currentScreen) {
      case "welcome":
        return (
          <RealTimeWelcomeScreen onLanguageSelect={handleLanguageSelect} />
        );

      case "start":
        return selectedLanguage ? (
          <StartScreen
            selectedLanguage={selectedLanguage}
            isConnecting={isConnecting}
            onStartSession={handleStartSession}
          />
        ) : (
          // If no language selected, fallback to welcome screen
          <RealTimeWelcomeScreen onLanguageSelect={handleLanguageSelect} />
        );

      case "conversation":
        return selectedLanguage ? (
          <ConversationScreen
            selectedLanguage={selectedLanguage}
            chat={chat}
            isAssistantSpeaking={isAssistantSpeaking}
            onSendMessage={handleSendMessage}
          />
        ) : (
          // If no language selected, fallback to welcome screen
          <RealTimeWelcomeScreen onLanguageSelect={handleLanguageSelect} />
        );

      default:
        return (
          <RealTimeWelcomeScreen onLanguageSelect={handleLanguageSelect} />
        );
    }
  };

  return (
    <div className="min-h-screen" key={currentScreen}>
      {currentScreen !== "welcome" && (
        <RealTimeHeader
          selectedLanguage={selectedLanguage}
          isSessionActive={isSessionActive}
          isConnecting={isConnecting}
          onBackClick={handleBackToWelcome}
          onStartSession={handleStartSession}
          onStopSession={handleStopSession}
          currentScreen={currentScreen}
        />
      )}
      {renderCurrentScreen()}
    </div>
  );
};

export default RealtimePage;
