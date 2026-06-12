import { useState, useEffect } from "react";
import { useSiteData } from "@/context/SiteDataContext";

export default function AnnouncementBar() {
  const { settings } = useSiteData();
  const messages = settings.announcement_messages;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || messages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, messages.length]);

  if (messages.length === 0) return null;

  return (
    <div
      className="h-9 bg-charcoal flex items-center justify-center cursor-default"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p className="text-paper text-[11px] uppercase tracking-[2px] font-sans font-medium transition-opacity duration-500">
        {messages[currentIndex % messages.length]}
      </p>
    </div>
  );
}
