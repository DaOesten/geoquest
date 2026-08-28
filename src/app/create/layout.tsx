export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="light"
      className="min-h-dvh text-[#0B0F12]"
      style={{ background: "radial-gradient(120% 90% at 20% 0%, #E4EEEF 0%, #F4F7F8 70%)" }}
    >
      <div className="max-w-[430px] mx-auto w-full min-h-dvh">
        {children}
      </div>
    </div>
  );
}
