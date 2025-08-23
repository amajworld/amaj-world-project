
import { getSession, signOutAction } from '@/app/actions/authActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Welcome, {session.email}!</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You have successfully logged in.</p>
          <form
            action={async () => {
              'use server';
              await signOutAction();
              redirect('/login');
            }}
            className="mt-4"
          >
            <Button type="submit" className="w-full">Sign Out</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
