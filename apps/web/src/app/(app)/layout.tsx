import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";
import type { SessionUser } from "@/types";

async function getSessionUser(): Promise<SessionUser | null> {
  const { getCurrentUser } = await import("@/lib/auth");
  return getCurrentUser();
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="flex h-screen">
      {user && (
        <Sidebar
          role={user.role}
          isPersonalMode={user.isPersonalMode}
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            role: user.role,
          }}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {user && <Header user={{ firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, role: user.role, isPersonalMode: user.isPersonalMode }} />}
        <main className="flex-1 overflow-auto bg-bg-subtle">
          <div className="w-full px-6 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
