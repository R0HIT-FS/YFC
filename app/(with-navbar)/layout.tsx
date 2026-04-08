import Navbar from "@/components/Navbar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
    <Navbar/>
      {children}
    </div>
  );
}