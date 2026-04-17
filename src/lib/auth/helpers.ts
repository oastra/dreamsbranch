import { createClient as createServerSupabase } from '../supabase/server';
import { db } from '../db';
import { redirect } from 'next/navigation';

export type AdminUserRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
};

export async function getSession() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getAdminUser(): Promise<AdminUserRecord | null> {
  const user = await getSession();
  if (!user?.email) return null;

  const admin = await db.adminUser.findUnique({
    where: { email: user.email },
  });

  return admin as AdminUserRecord | null;
}

export async function requireAdmin(): Promise<AdminUserRecord> {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/admin/login');
  }
  return admin;
}

export async function requireSuperAdmin(): Promise<AdminUserRecord> {
  const admin = await requireAdmin();
  if (admin.role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }
  return admin;
}

export function canManageContent(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'EDITOR';
}

export function canManageFinances(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManageUsers(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManageSettings(role: string): boolean {
  return role === 'SUPER_ADMIN';
}
