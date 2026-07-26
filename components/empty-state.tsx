import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state card">
      <div><i><Icon size={25}/></i><h3>{title}</h3><p>{description}</p>{children}</div>
    </div>
  );
}
