import React from 'react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || 'MEDIUM').toUpperCase();

  const styles = {
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  };

  const dots = {
    CRITICAL: 'bg-red-500 animate-ping',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-emerald-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono ${styles[sev] || styles.MEDIUM}`}>
      <span className="relative flex h-1.5 w-1.5">
        {sev === 'CRITICAL' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dots[sev] || dots.MEDIUM}`}></span>
      </span>
      {sev}
    </span>
  );
}
