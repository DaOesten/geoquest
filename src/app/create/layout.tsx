export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="light" className="min-h-dvh bg-[#F4F7F8] text-[#0B0F12]">
      {children}
    </div>
  );
}
