/**
 * AppBackground Component
 * 
 * Global background layer with React Bits Aurora integration.
 * Provides animated gradient background that sits behind all UI elements
 * without interfering with layout or interactions.
 */

import Aurora from "./Aurora";

interface AppBackgroundProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export const AppBackground = ({ 
  colorStops = ['#5227FF', '#7cff67', '#5227FF'], 
  amplitude = 1.0, 
  blend = 0.5,
  time,
  speed = 1.0
}: AppBackgroundProps) => {
  return (
    <div 
      id="app-background"
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <Aurora 
        colorStops={colorStops}
        amplitude={amplitude}
        blend={blend}
        time={time}
        speed={speed}
      />
    </div>
  );
};

