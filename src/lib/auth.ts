import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireUser(): Promise<string> {
  // @ts-expect-error: getServerSession returns unknown type, but we expect user.id
  const session: { user?: { id?: string } } = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id as string;
}
