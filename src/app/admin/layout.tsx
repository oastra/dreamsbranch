import { requireAdmin } from '@/lib/auth/helpers';
import { AdminSidebar } from '@/components/admin/sidebar';
import '../globals.css';

export const metadata = {
  title: 'DreamsBranch Admin',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-tertiary">
        <div className="flex">
          <AdminSidebar user={{ id: admin.id, name: admin.name, email: admin.email, role: admin.role }} />
          <main className="flex-1 min-h-screen">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
