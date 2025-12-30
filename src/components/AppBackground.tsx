/**
 * AppBackground Component
 * 
 * Global background layer for React Bits integration.
 * This component provides a container for animated/gradient backgrounds
 * that sit behind all UI elements without interfering with layout or interactions.
 * 
 * TODO: When ready, paste React Bits JS and CSS here.
 * The container is ready to accept React Bits background components.
 */

import { ReactNode } from "react";

interface AppBackgroundProps {
  children?: ReactNode;
}

export const AppBackground = ({ children }: AppBackgroundProps) => {
  return (
    <div 
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* React Bits background will be mounted here */}
      {/* 
        Example structure when React Bits is integrated:
        <ReactBitsBackground>
          {children}
        </ReactBitsBackground>
      */}
      {children}
    </div>
  );
};

