import { useState } from "react";
import {
  AcademicCapIcon,
  CodeBracketIcon,
  NewspaperIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface Prompt {
  text: string;
  icon: JSX.Element;
  gradient: string;
  related: string[];
}

export const usePrompts = (
  handleSend: (messageContent?: string) => void,
  setInput: React.Dispatch<React.SetStateAction<string>>
) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [relatedOptions, setRelatedOptions] = useState<string[]>([]);
  const [afterSelectScrollTarget, setAfterSelectScrollTarget] = useState<
    (() => void) | null
  >(null);

  const suggestionPrompts: Prompt[] = [
    {
      text: "Image Generation",
      icon: <PhotoIcon className="w-4 h-4" />,
      gradient: "from-green-600 to-cyan-700",
      related: [
        "Generate a landscape image",
        "Generate a realistic product mockup image",
      ],
    },
    {
      text: "Learning",
      icon: <AcademicCapIcon className="w-4 h-4" />,
      gradient: "from-pink-600 to-red-600",
      related: ["Top skills for 2025", "Remote learning tips"],
    },
    {
      text: "Development",
      icon: <CodeBracketIcon className="w-4 h-4" />,
      gradient: "from-indigo-600 to-purple-700",
      related: ["React authentication", "Optimize Node.js API"],
    },
    {
      text: "News",
      icon: <NewspaperIcon className="w-4 h-4" />,
      gradient: "from-yellow-600 to-orange-600",
      related: ["Latest AI research", "2025 market trends"],
    },
  ];

  const handlePromptSelect = (promptText: string, related: string[]) => {
    setSelectedPrompt(promptText);
    setRelatedOptions(related);
    setShowDropdown(true);
    // Smooth-scroll to prompts/related section if WelcomeScreen provided a callback
    if (afterSelectScrollTarget) afterSelectScrollTarget();
  };

  return {
    suggestionPrompts,
    showDropdown,
    relatedOptions,
    handlePromptSelect,
    setShowDropdown,
    // expose setter so the screen can define what to scroll to
    setAfterSelectScrollTarget,
  };
};
