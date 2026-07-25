export default function AppLoading() {
  return (
    <div className="flex h-screen">
      <div className="fixed inset-x-0 top-0 z-50 h-1 w-full overflow-hidden bg-border-default">
        <div className="h-full w-1/3 bg-accent-blue animate-progress-indeterminate" />
      </div>
      <aside className="flex w-64 flex-col gap-4 border-r border-border-default bg-bg-sidebar p-4">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-4 w-24" />
        <div className="mt-4 flex flex-col gap-3">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-4 w-36" />
          <div className="skeleton h-4 w-44" />
          <div className="skeleton h-4 w-32" />
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-bg-subtle p-8">
        <div className="mx-auto max-w-7xl">
          <div className="skeleton mb-8 h-8 w-64" />
          <div className="grid grid-cols-3 gap-6">
            <div className="skeleton h-32 rounded-lg" />
            <div className="skeleton h-32 rounded-lg" />
            <div className="skeleton h-32 rounded-lg" />
          </div>
          <div className="mt-8">
            <div className="skeleton mb-4 h-6 w-48" />
            <div className="skeleton h-64 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
