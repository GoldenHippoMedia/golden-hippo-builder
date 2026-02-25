import React from 'react';

export interface StatGridContainerProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

const COL_CLASS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

export function StatGridContainer({ children, columns = 4 }: StatGridContainerProps) {
  return (
    <div className={`max-w-7xl w-full mx-auto grid grid-cols-1 ${COL_CLASS[columns]} gap-4 mb-4`}>
      {children}
    </div>
  );
}
