import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function login(formData: FormData) {
  'use server';
  const password = String(formData.get('password') || '');
  if (!process.env.ADMIN_SECRET || password !== process.env.ADMIN_SECRET) {
    redirect('/admin/login?error=1');
  }
  const jar = await cookies();
  jar.set('ferdowsi_admin', password, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  redirect('/admin');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form action={login} className="bg-white border rounded-lg p-8 w-80 space-y-4">
        <h1 className="text-xl font-bold">Ferdowsi admin</h1>
        {error && <p className="text-sm text-red-600">Wrong password.</p>}
        <input
          type="password"
          name="password"
          placeholder="Admin password"
          className="w-full border rounded px-3 py-2"
          autoFocus
        />
        <button type="submit" className="w-full bg-black text-white rounded px-3 py-2">
          Sign in
        </button>
        <p className="text-xs text-gray-500">Set with the ADMIN_SECRET env var.</p>
      </form>
    </main>
  );
}
