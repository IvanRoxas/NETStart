import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sandbox | NETStart',
  description: 'Practice and test your code in the free-play Sandbox.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // We reuse the same authenticated layout logic because ConditionalLayout
  // in the root checks for /code-sandbox and renders the Sidebar/Topbar.
  return <>{children}</>;
}
