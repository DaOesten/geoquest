"use client";

export type QuestFilter = "all" | "live" | "new";

interface QuestFilterTabsProps {
  active: QuestFilter;
  onChange: (filter: QuestFilter) => void;
}

const TABS: { value: QuestFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "live", label: "Live" },
  { value: "new", label: "Neu" },
];

export function QuestFilterTabs({ active, onChange }: QuestFilterTabsProps) {
  return (
    <div className="flex gap-2 px-5" role="tablist" aria-label="Quests filtern">
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={
              isActive
                ? "min-h-11 inline-flex items-center px-4 rounded-pill bg-gq-teal text-gq-black text-tech text-[10px] tracking-[0.12em] font-bold shadow-glow transition-all duration-fast ease-gq"
                : "min-h-11 inline-flex items-center px-4 rounded-pill border border-border text-gq-grey text-tech text-[10px] tracking-[0.12em] font-bold transition-all duration-fast ease-gq hover:text-gq-teal hover:border-gq-teal"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
