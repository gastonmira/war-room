'use client';

// components/UtcClock.tsx
// Client-side UTC clock that updates every second

import React, { useState, useEffect } from 'react';
import { formatLocalTime } from '../lib/utils';

export default function UtcClock() {
  const [time, setTime] = useState<string>('--:--:-- ---');

  useEffect(() => {
    const tick = () => setTime(formatLocalTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-xs" style={{ color: '#6b7f6b', letterSpacing: '0.05em' }}>
      {time}
    </span>
  );
}
