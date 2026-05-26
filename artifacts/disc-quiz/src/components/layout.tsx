import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2 font-bold text-lg tracking-tight">
            DISC Discovery
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t py-6 md:py-8 mt-auto">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>
            Kuis ini dirancang untuk penemuan diri dan pengembangan pribadi.
          </p>
        </div>
      </footer>
    </div>
  );
}
