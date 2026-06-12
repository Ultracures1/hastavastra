import { useState, useEffect, useCallback } from "react";
import { announcementMessages } from "@/data/products";

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextMessage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % announcementMessages.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextMessage, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextMessage]);

  return (
    <div
      className="h-9 bg-charcoal flex items-center justify-center cursor-default"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p className="text-paper text-[11px] uppercase tracking-[2px] font-sans font-medium transition-opacity duration-500">
        {announcementMessages[currentIndex]}
      </p>
    </div>
  );
}
