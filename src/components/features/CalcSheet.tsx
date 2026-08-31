import React from 'react';

interface CalcSheetProps {
  title: string;
  clause?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  mono?: boolean;
}

export default function CalcSheet({ title, clause, badge, children, mono = true }: CalcSheetProps) {
  return (
    <div className="calc-sheet mb-4">
      <div className="calc-sheet-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600, color: '#C9D1D9', fontSize: 12 }}>{title}</span>
          {clause && <span style={{ fontSize: 10, color: '#656D76' }}>{clause}</span>}
        </div>
        {badge && <div>{badge}</div>}
      </div>
      <div
        className="calc-sheet-body"
        style={mono ? {} : { fontFamily: 'inherit', fontSize: 13, color: '#E6EDF3' }}
      >
        {children}
      </div>
    </div>
  );
}
