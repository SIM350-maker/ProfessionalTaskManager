import Link from 'next/link';

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-6xl font-bold text-text-tertiary">404</h1>
      <p className="mt-4 text-lg text-text-secondary">Page not found</p>
      <p className="mt-2 text-sm text-text-tertiary">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-text-inverse hover:bg-accent-blue-hover"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
