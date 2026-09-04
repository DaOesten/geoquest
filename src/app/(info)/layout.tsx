export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Unlike the app screens (capped at 430px), these outward-facing pages are
  // usually opened on a laptop or desktop — they get the full viewport and
  // scale their own content widths per breakpoint.
  return <div className="min-h-dvh bg-gq-black">{children}</div>;
}
