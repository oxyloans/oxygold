export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  isImage?: boolean;
  timestamp?: string | number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechLang: string;
  imageUrl: string;
  assistantName: string;
}

// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//     SpeechRecognition: any;
//   }
// }

export const LANGUAGES: LanguageConfig[] = [
   {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
    speechLang: "te-IN",
    imageUrl:
      "https://th.bing.com/th/id/OIP.-ixiQp5esJ7JRIHJdHf-jgHaEc?w=202&h=121&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3",
    assistantName: "Vedika",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    speechLang: "en-US",
    imageUrl:
      "https://img.freepik.com/premium-photo/woman-suit-with-smile-her-face_662214-22756.jpg",
    assistantName: "Smaira",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    speechLang: "hi-IN",
    imageUrl:
      "https://static.vecteezy.com/system/resources/thumbnails/045/782/543/small/professional-businesswoman-in-formal-suit-confident-smile-modern-office-background-corporate-leadership-stock-for-business-marketing-branding-photo.jpg",
    assistantName: "Praigya",
  },
];
