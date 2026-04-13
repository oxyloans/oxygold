import React from "react";
import "../styles.css";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = "md",
  message = "Loading...",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Outer ring with pulse */}
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-full animate-ping opacity-20`}
          style={{
            background: "linear-gradient(135deg, hsl(35, 85%, 30%), hsl(38, 80%, 45%), hsl(40, 70%, 65%))",
          }}
        />
        
        {/* Main spinner */}
        <div
          className={`${sizeClasses[size]} rounded-full border-t-transparent animate-spin`}
          style={{
            borderColor: "hsl(30, 20%, 90%)",
            borderTopColor: "hsl(38, 80%, 45%)",
            borderRightColor: "hsl(40, 70%, 65%)",
          }}
        />
        
        {/* Inner sparkle */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              background: "linear-gradient(135deg, hsl(38, 80%, 45%), hsl(40, 70%, 65%))",
              boxShadow: "0 0 10px hsl(38, 80%, 45%)",
            }}
          />
        </div>
      </div>

      {/* Brand text */}
      <div className="text-center space-y-1">
        <p
          className="font-heading text-xl font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, hsl(35, 85%, 30%), hsl(38, 80%, 45%), hsl(40, 70%, 65%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          OXYGOLD
        </p>
        <p
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: "hsl(20, 8%, 45%)" }}
        >
          {message}
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: "hsl(38, 80%, 45%)",
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "hsl(30, 15%, 97%)" }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
