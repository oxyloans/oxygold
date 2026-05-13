import React, { useEffect, useRef, useState } from "react";
import { X, Download, RefreshCw, AlertCircle, Loader2, Upload } from "lucide-react";

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerating: boolean;
  generatedImage: string | null;
  error: string | null;
  onRegenerate: () => void;
  productImage: string;
  userImage: string | null;
}

const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  isGenerating,
  generatedImage,
  error,
  onRegenerate,
  productImage,
  userImage,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `virtual-tryon-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: open in new tab if CORS blocks the fetch
      window.open(generatedImage, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D5] bg-gradient-to-r from-[#FDFBF7] to-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#C29B27] to-[#A88820] flex items-center justify-center shadow-lg shadow-[#C29B27]/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394a2.25 2.25 0 001.423-1.423L16.5 16l.394 1.183a2.25 2.25 0 001.423 1.423L19.75 19l-1.433.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1A1A1A] tracking-tight">
                Virtual Try-On Preview
              </h2>
              <p className="text-[11px] text-[#8A8A8A] font-medium">
                See how this jewellery looks on you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center bg-[#F5F2EE] hover:bg-[#EDE9E2] text-[#8A8A8A] hover:text-[#1A1A1A] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-[#F5EDD6] animate-ping opacity-20" />
                {/* Spinning ring */}
                <div className="relative h-20 w-20 rounded-full border-4 border-[#F5EDD6] border-t-[#C29B27] animate-spin" />
                {/* Inner sparkle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#C29B27] to-[#A88820] animate-pulse shadow-lg shadow-[#C29B27]/30" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">
                  Creating Virtual Try-On...
                </h3>
                <p className="text-[13px] text-[#8A8A8A] max-w-md leading-relaxed">
                  Please wait while we generate your personalized preview. This usually takes 40-50 seconds.
                </p>
              </div>
              {/* Progress dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#C29B27] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center border-4 border-rose-100">
                <AlertCircle className="h-10 w-10 text-rose-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">
                  Failed to Generate Try-On
                </h3>
                <p className="text-[13px] text-[#8A8A8A] max-w-md leading-relaxed">
                  {error}
                </p>
              </div>
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C29B27] text-white text-[13px] font-bold hover:bg-[#A88820] transition-all shadow-lg shadow-[#C29B27]/20 hover:scale-105 active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Success State - Generated Image */}
          {generatedImage && !isGenerating && !error && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Image Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Your Photo */}
                {userImage && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-[#8A8A8A] uppercase tracking-widest">
                        Your Photo
                      </h3>
                    </div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F0E8] border-2 border-[#E8E0D5] shadow-sm">
                      <img
                        src={userImage}
                        alt="Your Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Original Product */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-[#8A8A8A] uppercase tracking-widest">
                      Original Jewellery
                    </h3>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F0E8] border-2 border-[#E8E0D5] shadow-sm">
                    <img
                      src={productImage}
                      alt="Original Product"
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                </div>

                {/* Virtual Try-On Result */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-[#C29B27] uppercase tracking-widest flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        />
                      </svg>
                      Virtual Try-On
                    </h3>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F0E8] border-2 border-[#C29B27] shadow-lg shadow-[#C29B27]/10">
                    <img
                      src={generatedImage}
                      alt="Virtual Try-On Result"
                      className="w-full h-full object-cover"
                    />
                    {/* Premium badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#C29B27] text-white text-[9px] font-black uppercase tracking-wider shadow-lg">
                      AI Generated
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg
                      className="h-4 w-4 text-[#C29B27]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-[#1A1A1A] mb-1">
                      AI-Generated Virtual Try-On
                    </p>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      This is an AI-generated representation to help you visualize how the jewellery might look when worn. Actual appearance may vary based on lighting, skin tone, and other factors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C29B27] text-white text-[13px] font-bold hover:bg-[#A88820] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#C29B27]/20"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </button>
                <button
                  onClick={onRegenerate}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#C29B27] text-[#C29B27] text-[13px] font-bold hover:bg-amber-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Try-On
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
