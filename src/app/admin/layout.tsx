
// This can be a simple layout for the admin section, or can be expanded later.
// For now, it just passes children through.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
