import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rewards Shop',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
