import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
              <span className="text-xl">🏏</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Cricbook</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex min-h-screen items-center justify-center pt-20 pb-10 px-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}