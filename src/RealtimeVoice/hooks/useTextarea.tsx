import { useCallback, useEffect } from "react";

export const useTextarea = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  input: string
) => {
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  return { adjustTextareaHeight };
};
