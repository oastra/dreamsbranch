// Simple pass-through — login lives here without any auth guard.
// All dashboard pages live under (protected)/layout.tsx which calls requireAdmin().
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
