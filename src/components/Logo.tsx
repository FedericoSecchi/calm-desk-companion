import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };
  
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={`${sizeClasses[size]} rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105`}>
        <Leaf className="h-[60%] w-[60%] text-primary-foreground" />
      </div>
      {showText && (
        <span className={`font-heading ${textSizes[size]} text-foreground`}>
          Calmo
        </span>
      )}
    </Link>
  );
};
