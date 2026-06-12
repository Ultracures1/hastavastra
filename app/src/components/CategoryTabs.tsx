import { useState } from "react";

const tabs = [
  { label: "SAREE", id: "sarees" },
  { label: "BLOUSE", id: "blouses" },
  { label: "WOMEN", id: "women" },
  { label: "HEARTWORK", id: "heartwork" },
];

export default function CategoryTabs() {
  const [activeTab, setActiveTab] = useState("sarees");

  return (
    <div className="sticky top-[60px] z-40 bg-paper border-b border-softgrey/20">
      <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-center gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 h-full text-xs uppercase tracking-[2px] font-sans font-medium transition-all duration-300 border-b-2 ${
              activeTab === tab.id
                ? "text-charcoal border-charcoal font-semibold"
                : "text-softgrey border-transparent hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
