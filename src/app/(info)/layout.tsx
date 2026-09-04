export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gq-black">
      <div className="max-w-[430px] mx-auto w-full min-h-dvh">{children}</div>
    </div>
  );
}
