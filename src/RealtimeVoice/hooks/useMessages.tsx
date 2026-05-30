import { useCallback, useState, useEffect } from "react";
// import BASE_URL from "../../Config";
import { Message } from "../types/types";
import axios from "axios";
import { LanguageConfig, ChatMessage } from "../types/types";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../Config";

interface UseMessagesProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  remainingPrompts: string | null;
  setRemainingPrompts: React.Dispatch<React.SetStateAction<string | null>>;
  threadId: string | null;
  setThreadId: React.Dispatch<React.SetStateAction<string | null>>;
  questionCount: number;
  setQuestionCount: React.Dispatch<React.SetStateAction<number>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const cleanContent = (content: string): string => {
  return content
    .replace(/\?\d+:\d+\?source\?/g, "")
    .replace(/(\w+)\?s/g, "$1")
    .replace(/\?.*?\?/g, "")
    .trim();
};

// --- NEW: robust image/url extraction ---
const extractImageUrl = (raw: string): { isImage: boolean; url?: string } => {
  const data = raw.trim();

  // data:image base64
  if (data.startsWith("data:image/")) {
    return { isImage: true, url: data };
  }

  // Markdown image: ![alt](url)
  const md = data.match(/!\[[^\]]*]\((https?:\/\/[^\s)]+)\)/i);
  if (md?.[1]) {
    return { isImage: true, url: md[1] };
  }

  // HTML <img src="...">
  const html = data.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (html?.[1]) {
    return { isImage: true, url: html[1] };
  }

  // Bare URL (accept likely image links or signed urls with query)
  const bare = data.match(/https?:\/\/[^\s]+/i)?.[0];
  if (bare) {
    // If it ends with common image extensions OR has a querystring (often signed)
    if (
      /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(bare) ||
      /\?/.test(bare)
    ) {
      return { isImage: true, url: bare };
    }
  }

  return { isImage: false };
};

export const useMessages = ({
  messages,
  setMessages,
  input,
  setInput,
  setLoading,
  messagesEndRef,
  abortControllerRef,
  remainingPrompts,
  setThreadId,
  setRemainingPrompts,
  threadId,
  questionCount, // Updated: Received as prop to check limit
  setQuestionCount, // Updated: Received as prop to increment count
  setShowModal, // Updated: Received as prop to show modal when limit reached
}: UseMessagesProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const BASE_URL = API_BASE_URL;
  useEffect(() => {
    const isLogin = localStorage.getItem("userId");
    // Show modal when user tries to ask their 5th question
    if (questionCount >= 4 && !isLogin) {
      setShowModal(true);
    }
  }, [questionCount]);

  const handleSend = useCallback(
    async (messageContent?: string) => {
      const textToSend = messageContent || input.trim();
      if (!textToSend) return;
      // Updated: Added check for question limit before sending; show modal and prevent send if limit reached for non-logged-in users
      const isLoggedIn = !!localStorage.getItem("userId");
      if (!isLoggedIn && questionCount >= 4) {
        setShowModal(true);
        return;
      }
      const userMessage: Message = { role: "user", content: textToSend };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setLoading(true);
      setQuestionCount((prevCount) => prevCount + 1);
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const response = await fetch(`${BASE_URL}/student-service/user/chat1`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMessages),
          signal: controller.signal,
        });

        const data = await response.text();
        if (!response.ok) throw new Error(`Error: ${data}`);

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);

        const { isImage, url } = extractImageUrl(data);
        const assistantReply: Message = {
          role: "assistant",
          // IMPORTANT: do NOT clean/strip when it's an image url (fixes "Failed to load image")
          content: isImage ? url || data.trim() : cleanContent(data),
          isImage,
        };

        setTimeout(() => setMessages((prev) => [...prev, assistantReply]), 50);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          isImage: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setTimeout(() => {
          setLoading(false);
          abortControllerRef.current = null;
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // keep your redirect after first send from welcome screen
          if (location.pathname === "/genoxy") {
            navigate("/genoxy/chat");
          }
        }, 100);
      }
    },
    [
      messages,
      input,
      setMessages,
      setInput,
      setLoading,
      messagesEndRef,
      abortControllerRef,
      location,
      navigate,
      questionCount,
      setQuestionCount,
      setShowModal, // Updated: Dependency for showing modal
    ],
  );

  const handleEdit = useCallback(
    async (messageId: string, newContent: string) => {
      if (!newContent.trim()) return;
      const isLoggedIn = !!localStorage.getItem("userId");
      if (!isLoggedIn && questionCount >= 4) {
        setShowModal(true);
        return;
      }

      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent } : msg,
      );
      setMessages(updatedMessages);
      setInput("");
      setLoading(true);
      setQuestionCount((prev) => prev + 1);
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const response = await fetch(`${BASE_URL}/student-service/user/chat1`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMessages),
          signal: controller.signal,
        });

        const data = await response.text();
        if (!response.ok) throw new Error(`Error: ${data}`);

        const { isImage, url } = extractImageUrl(data);
        const assistantReply: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: isImage ? url || data.trim() : cleanContent(data),
          isImage,
        };

        setMessages((prev) => [...prev, assistantReply]);
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted");
        } else {
          console.error("Chat error:", error);
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            isImage: false,
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      messages,
      setMessages,
      setLoading,
      messagesEndRef,
      abortControllerRef,
      questionCount,
      setQuestionCount,
      setShowModal,
    ],
  );

  const handleFileUpload = async (
    files: File[] | null,
    userPrompt: string,
  ): Promise<string | null> => {
    if (Number(remainingPrompts) === 0 && remainingPrompts != null) {
      return await Promise.resolve(null);
    }

    setLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userPrompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const formData = new FormData();

      // append multiple
      if (files && threadId === null) {
        files.forEach((file) => formData.append("files", file));
      }

      formData.append("prompt", userPrompt);
      if (threadId) formData.append("threadId", threadId);

      const response = await axios.post(
        `${BASE_URL}/student-service/user/chat-with-files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const {
        answer,
        threadId: newThreadId,
        remainingPrompts: updatedPrompts,
      } = response.data;

      setThreadId(newThreadId);
      setRemainingPrompts(updatedPrompts);

      const { isImage, url } = extractImageUrl(answer);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isImage
          ? url || String(answer).trim()
          : cleanContent(String(answer)),
        isImage,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      if (location.pathname === "/genoxy") {
        navigate("/genoxy/chat");
      }

      return newThreadId;
    } catch (error) {
      console.error("File upload failed:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, the file upload failed. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleSend, handleEdit, handleFileUpload };
};

class VoiceSessionService {
  private peerConnection: RTCPeerConnection | null = null;
  private micStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;

  async getEphemeralToken(
    instructions: string,
    assistantId: string,
    voicemode: string,
  ): Promise<string> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/student-service/user/voicetoken?assistantId=${assistantId}&voicemode=${voicemode}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instructions }),
        },
      );

      const data = await res.json();

      console.log("Voice Token Response:", data);

      return data?.value || "";
    } catch (error) {
      console.error("Failed to get ephemeral token:", error);
      throw error;
    }
  }

  sendMessage(message: string) {
    if (!this.dataChannel) {
      console.error("Data channel is not connected");
      return;
    }

    if (this.dataChannel.readyState !== "open") {
      console.error("Data channel not open:", this.dataChannel.readyState);
      return;
    }

    this.dataChannel.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      }),
    );

    this.dataChannel.send(
      JSON.stringify({
        type: "response.create",
      }),
    );
  }

  async startSession(
    assistantId: string,
    selectedLanguage: any,
    selectedInstructions: string,
    onMessage: (message: any) => void,
    onAssistantSpeaking: (speaking: boolean) => void,
    navigate: (path: string) => void,
    voicemode: string,
  ): Promise<RTCDataChannel> {
    this.stopSession();

    try {
      const EPHEMERAL_KEY = await this.getEphemeralToken(
        selectedInstructions,
        assistantId,
        voicemode,
      );

      console.log("EPHEMERAL KEY:", EPHEMERAL_KEY);

      const pc = new RTCPeerConnection();

      this.peerConnection = pc;

      pc.onconnectionstatechange = () => {
        console.log("Connection State:", pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", pc.iceConnectionState);
      };

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;

      pc.ontrack = (event) => {
        console.log("Audio track received");
        audioEl.srcObject = event.streams[0];
      };

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.micStream!);
      });

      const dc = pc.createDataChannel("oai-events");

      this.dataChannel = dc;

      this.setupDataChannelHandlers(dc, onMessage, onAssistantSpeaking);

      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);

      console.log("Creating SDP request...");

      const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpRes.ok) {
        const errorText = await sdpRes.text();

        console.error("SDP Error Response:", errorText);

        throw new Error(errorText);
      }

      const sdpText = await sdpRes.text();

      console.log("SDP Answer Received");

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: sdpText,
      };

      await pc.setRemoteDescription(answer);

      console.log("Realtime session connected");

      return dc;
    } catch (error) {
      console.error("Failed to start session:", error);

      this.stopSession();

      throw error;
    }
  }

  private setupDataChannelHandlers(
    dc: RTCDataChannel,
    onMessage: (message: any) => void,
    onAssistantSpeaking: (speaking: boolean) => void,
  ) {
    let assistantText = "";

    dc.onopen = () => {
      console.log("🟢 Data channel opened");

      dc.send(
        JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["audio", "text"],
            voice: "shimmer",
          },
        }),
      );
    };

    dc.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("Realtime Event:", data);

        switch (data.type) {
          case "response.output_text.delta":
            assistantText += data.delta || "";

            onMessage({
              role: "assistant",
              text: assistantText,
              timestamp: new Date().toLocaleTimeString(),
            });
            break;

          case "response.output_text.done":
            assistantText = "";
            break;

          case "input_audio_buffer.speech_started":
            onAssistantSpeaking(false);
            break;

          case "response.audio.delta":
            onAssistantSpeaking(true);
            break;

          case "response.audio.done":
            onAssistantSpeaking(false);
            break;

          case "conversation.item.input_audio_transcription.completed":
            if (data.transcript) {
              onMessage({
                role: "user",
                text: data.transcript,
                timestamp: new Date().toLocaleTimeString(),
              });
            }
            break;

          case "error":
            console.error("Realtime Error:", data);
            break;

          default:
            console.log("Unhandled Event:", data.type);
            break;
        }
      } catch (err) {
        console.error("Failed to parse realtime event:", err);
      }
    };

    dc.onclose = () => {
      console.log("🔴 Data channel closed");
    };

    dc.onerror = (err) => {
      console.error("Data channel error:", err);
    };
  }

  stopSession() {
    try {
      this.dataChannel?.close();

      if (this.micStream) {
        this.micStream.getTracks().forEach((track) => track.stop());
      }

      this.peerConnection?.close();
    } catch (err) {
      console.error(err);
    }

    this.dataChannel = null;
    this.micStream = null;
    this.peerConnection = null;
  }
}

export const voiceSessionService = new VoiceSessionService();
