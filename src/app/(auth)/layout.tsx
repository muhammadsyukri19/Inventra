import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

/**
 * Auth layout — clean, centered layout without sidebar.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      {children}
    </main>
  );
}
