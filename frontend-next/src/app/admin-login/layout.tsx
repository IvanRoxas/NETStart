import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal Login',
  icons: {
    icon: [
      { url: '/favicon-admin-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-admin.png', sizes: '390x394', type: 'image/png' },
    ],
    shortcut: '/favicon-admin-32.png',
    apple: '/favicon-admin.png',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
