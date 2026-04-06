import { prisma } from "@/infrastructure/prisma/client";

export default async function Home() {
  const count = await prisma.work.count();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">satori</h1>
      <p className="mt-4">Work count: {count}</p>
    </main>
  );
}