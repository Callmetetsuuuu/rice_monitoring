import React from 'react';

type Props = {
  onOpenInfo?: () => void;
};

export function Header({ onOpenInfo }: Props): JSX.Element {
  return (
    <header className="mb-10">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-white/80 px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-emerald-600">
            <path d="M12 2s4 1 6 4c2 3 1 7-2 10-3 3-7 5-10 3-3-2-4-6-2-9C7 5 12 2 12 2z" fill="#059669" />
            <path d="M12 7c1.5 0 3 1 3 3s-1.5 3-3 3-3-1-3-3 1.5-3 3-3z" fill="#ecfccb" />
          </svg>
          <div>
            <h1 className="text-lg font-bold text-emerald-800">Rice Plant Health Monitor</h1>
            <p className="text-xs text-emerald-600">Field monitoring & RGB analysis</p>
          </div>
        </div>

        <nav className="hidden sm:flex sm:items-center sm:gap-6">
          <a href="#" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">Home</a>
          <a href="#analysis" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">Analysis</a>
          <a href="#docs" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">Docs</a>
          <a href="#about" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">About</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenInfo?.()}
            className="hidden rounded-md px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-100 sm:inline-flex"
          >
            How it works
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-md p-2 text-emerald-600 hover:bg-emerald-100"
            aria-label="GitHub"
          >
            <svg height="20" viewBox="0 0 16 16" width="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.6 7.6 0 018 4.58c.68.003 1.36.092 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.28.24.53.73.53 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>

          <div className="hidden sm:block">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#d1fae5" />
              <path d="M7 13c1.5-2 4-3 5-3s3.5 1 5 3" stroke="#065f46" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
