import { useSiteData } from "@/context/SiteDataContext";

export default function Marquee() {
  const { settings } = useSiteData();
  const text = settings.marquee_text || " ";
  const repeated = text.repeat(4);

  return (
    <div className="h-10 bg-charcoal overflow-hidden flex items-center">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="text-ochre text-[11px] uppercase tracking-[2px] font-sans font-medium">
          {repeated}
        </span>
        <span className="text-ochre text-[11px] uppercase tracking-[2px] font-sans font-medium">
          {repeated}
        </span>
      </div>
    </div>
  );
}
