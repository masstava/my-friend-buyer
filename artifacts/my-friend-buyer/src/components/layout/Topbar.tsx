import { UserButton } from "@clerk/react";

export default function Topbar() {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs or page title could go here */}
      </div>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/login" />
      </div>
    </header>
  );
}
