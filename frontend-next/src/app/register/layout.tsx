import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NETStart: Your journey starts here",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
