'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Next.js App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EFF7] p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 text-center border border-red-100">
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          The application encountered an unexpected error. We've logged the details and are working to fix it.
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()}
            className="h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 gap-2 text-white"
          >
            <RefreshCcw className="h-4 w-4" /> Try again
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="h-12 rounded-xl font-bold gap-2"
          >
            <Link to="/">
              <Home className="h-4 w-4" /> Go to Homepage
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-neutral-50 rounded-xl text-left border overflow-auto">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Debug Info</p>
            <code className="text-[10px] text-red-600 font-mono break-all">
              {error.message || 'No message available'}
              {error.digest && <div className="mt-1 opacity-50">Digest: {error.digest}</div>}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
