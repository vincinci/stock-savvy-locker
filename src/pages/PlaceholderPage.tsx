
import { useLocation } from "react-router-dom";

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.charAt(0).toUpperCase() + 
                  location.pathname.split('/').pop()?.slice(1);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{pageName}</h1>
        <p className="text-muted-foreground">This page is under construction.</p>
      </div>
      
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 rounded-full bg-blue-100 p-3">
          <div className="h-10 w-10 text-primary animate-pulse-subtle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
        </div>
        <h3 className="mb-2 text-xl font-semibold">Coming Soon</h3>
        <p className="mb-8 text-center text-gray-500">
          This feature is currently in development and will be available soon.
        </p>
      </div>
    </div>
  );
}
