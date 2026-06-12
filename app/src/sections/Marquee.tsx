export default function Marquee() {
  const text = "EARN ON EVERY PURCHASE AND REDEEM POINTS AT 1 POINT = \u20B91  |  REDEEM AS MANY POINTS AS YOU LIKE  |  ";
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
