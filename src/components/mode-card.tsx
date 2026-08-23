import { BrushStrokeButton } from "./brush-stroke-button";

interface ModeCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function ModeCard({ title, description, href, icon }: ModeCardProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-card border border-border bg-[#0F2429] p-6 shadow-card transition-all duration-base ease-gq hover:border-gq-teal/45 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gq-teal/10 text-gq-teal">
        {icon}
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-display text-3xl text-gq-white">{title}</h2>
        <p className="font-body text-sm text-gq-grey">{description}</p>
      </div>

      <BrushStrokeButton href={href}>{title}</BrushStrokeButton>
    </div>
  );
}
