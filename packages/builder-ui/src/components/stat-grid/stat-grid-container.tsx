import React from 'react';

export interface StatGridContainerProps {
  children: React.ReactNode;
}

export function StatGridContainer(props: StatGridContainerProps) {
  return <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">{props.children}</div>;
}
