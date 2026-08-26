"use client";

interface TextModuleProps {
  content: string;
}

export function TextModule({ content }: TextModuleProps) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-gq-teal mt-1 shrink-0">&#x2022;</span>
              <span className="font-body text-base leading-relaxed text-foreground">{line.slice(2)}</span>
            </div>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="font-body text-base leading-relaxed text-foreground">
            {line}
          </p>
        );
      })}
    </div>
  );
}
