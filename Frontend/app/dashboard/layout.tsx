'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TrendingDown } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgb(8,8,10)' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mx-auto flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'rgb(8,8,10)' }}>
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto pt-20 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
