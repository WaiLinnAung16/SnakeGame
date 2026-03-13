import { SnakeGame } from "@/components/snake-game";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(163,230,53,0.15),transparent_30%),linear-gradient(160deg,#09090b,#0f172a)]" />
      <div className="mx-auto flex max-w-4xl justify-center">
        <SnakeGame />
      </div>
    </main>
  );
}
