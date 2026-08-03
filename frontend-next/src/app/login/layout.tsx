import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NETStart: Continue your journey",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
