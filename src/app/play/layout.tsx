export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" className="min-h-dvh bg-gq-black text-gq-white">
      {children}
    </div>
  );
}
