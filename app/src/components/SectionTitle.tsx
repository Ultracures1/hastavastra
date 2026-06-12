interface SectionTitleProps {
  title: string;
  centered?: boolean;
}

export default function SectionTitle({ title, centered = true }: SectionTitleProps) {
  return (
    <div className={`mb-10 ${centered ? "text-center" : ""}`}>
      <h2 className="text-charcoal text-sm uppercase tracking-[4px] font-sans font-medium">
        <span className="text-softgrey mr-3">&#8212;</span>
        {title}
        <span className="text-softgrey ml-3">&#8212;</span>
      </h2>
    </div>
  );
}
