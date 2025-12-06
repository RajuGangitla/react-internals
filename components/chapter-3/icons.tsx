"use client";

import { ReactNode } from "react";

type IconProps = {
  size?: "small" | "medium" | "large";
  color?: "white" | "black" | "red" | "blue" | "yellow" | "green";
  className?: string;
};

const sizeMap = {
  small: "w-3 h-3",
  medium: "w-4 h-4",
  large: "w-6 h-6",
};

const colorMap = {
  white: "text-white",
  black: "text-zinc-900 dark:text-zinc-100",
  red: "text-red-500",
  blue: "text-blue-500",
  yellow: "text-yellow-500",
  green: "text-emerald-500",
};

// Loading Spinner Icon
export const LoadingIcon = ({ size = "medium", color = "black", className = "" }: IconProps) => {
  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${colorMap[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Error Icon
export const ErrorIcon = ({ size = "medium", color = "red", className = "" }: IconProps) => {
  return (
    <svg
      className={`${sizeMap[size]} ${colorMap[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
};

// Warning Icon
export const WarningIcon = ({ size = "medium", color = "yellow", className = "" }: IconProps) => {
  return (
    <svg
      className={`${sizeMap[size]} ${colorMap[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
};

// Check/Success Icon
export const CheckIcon = ({ size = "medium", color = "green", className = "" }: IconProps) => {
  return (
    <svg
      className={`${sizeMap[size]} ${colorMap[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
};

// Avatar Icon/Placeholder
export const AvatarIcon = ({ size = "medium", className = "" }: IconProps) => {
  const avatarSizeMap = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div
      className={`${avatarSizeMap[size]} rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-medium text-xs ${className}`}
      aria-hidden="true"
    >
      JD
    </div>
  );
};

// Send Icon
export const SendIcon = ({ size = "medium", color = "black", className = "" }: IconProps) => {
  return (
    <svg
      className={`${sizeMap[size]} ${colorMap[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  );
};

// Wrapper component for icons with label (for demonstration)
type IconWrapperProps = {
  icon: ReactNode;
  label: string;
};

export const IconWrapper = ({ icon, label }: IconWrapperProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

