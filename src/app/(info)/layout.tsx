export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Unlike the app screens (capped at 430px), these outward-facing pages are
  // usually opened on a laptop or desktop — they get the full viewport and
  // scale their own content widths per breakpoint.
  //
  // Die Fläche malt seit 2026-09-06 `InfoPageShell` selbst, weil Impressum und
  // Datenschutz hell sind und die übrigen Seiten dunkel. Ein festes
  // `bg-gq-black` hier würde unter den hellen Seiten durchscheinen.
  return <div className="min-h-dvh">{children}</div>;
}
