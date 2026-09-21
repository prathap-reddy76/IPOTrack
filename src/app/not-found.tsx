import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-full mb-6">
        <FileQuestion className="h-16 w-16 text-emerald-600 dark:text-emerald-500" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
        Page Not Found
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        We couldn&apos;t find the page you were looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white px-8">
        <Link href="/">
          Go Home
        </Link>
      </Button>
    </div>
  );
}
