export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle p-4">
      <div className="w-full max-w-5xl rounded-lg border border-border-default bg-bg-card p-8 shadow-card">
        <div className="skeleton mx-auto mb-6 h-8 w-32" />
        <div className="flex flex-col gap-4">
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton mt-2 h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
