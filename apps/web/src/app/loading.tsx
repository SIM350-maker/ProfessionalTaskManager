export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle">
      <div className="flex flex-col items-center gap-3">
        <div className="skeleton h-10 w-40" />
        <div className="skeleton h-4 w-64" />
      </div>
    </div>
  );
}
