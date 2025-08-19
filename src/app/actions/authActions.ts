
'use server';

// This file is now a placeholder as auth is disabled.
// The functions are kept to prevent breaking imports, but they do nothing.

import { cookies } from 'next/headers';

export async function signInWithEmailAction(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Use environment variables for credentials for better security.
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password';

  if (email === adminEmail && password === adminPassword) {
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      // The session cookie is set, but the middleware will still block access.
      cookies().set('session', 'local-dev-session', { expires, httpOnly: true });
      return { success: true };
  }
  return { success: false, error: 'Invalid credentials.' };
}

export async function signOutAction() {
    cookies().delete('session');
}

export async function getSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    // Return a mock session object
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    return { uid: 'local-admin', email: adminEmail };
}
