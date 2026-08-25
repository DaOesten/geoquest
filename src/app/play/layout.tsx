export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" className="min-h-dvh bg-gq-black text-gq-white">
      <div className="max-w-[430px] mx-auto w-full min-h-dvh">
        {children}
      </div>
    </div>
  );
}
