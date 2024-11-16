import { FC } from "react";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "white";
}

const Loading: FC<LoadingProps> = ({ size = "medium", color = "primary" }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  const colorClasses = {
    primary: "border-primary",
    white: "border-white",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          animate-spin rounded-full
          border-t-2 border-b-2
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
      />
    </div>
  );
};

export default Loading;
