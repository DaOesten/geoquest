"use client";

export type QuestManagementFilter = "all" | "draft";

interface QuestManagementFilterTabsProps {
  active: QuestManagementFilter;
  onChange: (filter: QuestManagementFilter) => void;
}

const TABS: { value: QuestManagementFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "draft", label: "Entwurf" },
];

export function QuestManagementFilterTabs({ active, onChange }: QuestManagementFilterTabsProps) {
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
                ? "min-h-11 inline-flex items-center px-4 rounded-pill bg-primary text-primary-foreground text-tech text-[10px] tracking-[0.12em] font-bold shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_0_18px_hsl(var(--primary)/0.35)] transition-all duration-fast ease-gq"
                : "min-h-11 inline-flex items-center px-4 rounded-pill border border-border text-muted-foreground text-tech text-[10px] tracking-[0.12em] font-bold transition-all duration-fast ease-gq hover:text-primary hover:border-primary"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
