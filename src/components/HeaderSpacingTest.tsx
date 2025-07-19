import React, { useEffect, useRef } from 'react';

const HeaderSpacingTest = () => {
  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const measureSpacing = () => {
      if (!leftRef.current || !centerRef.current || !rightRef.current || !headerRef.current) return;

      const leftRect = leftRef.current.getBoundingClientRect();
      const centerRect = centerRef.current.getBoundingClientRect();
      const rightRect = rightRef.current.getBoundingClientRect();
      const headerRect = headerRef.current.getBoundingClientRect();

      console.log('🔧 Header Spacing Measurements:');
      console.log(`Total header width: ${headerRect.width}px`);
      console.log(`Left section width: ${leftRect.width}px`);
      console.log(`Center section width: ${centerRect.width}px`);
      console.log(`Right section width: ${rightRect.width}px`);
      console.log(`Gap before center: ${centerRect.left - leftRect.right}px`);
      console.log(`Gap after center: ${rightRect.left - centerRect.right}px`);
      console.log(`Center section offset from true center: ${Math.abs((centerRect.left + centerRect.width/2) - (headerRect.left + headerRect.width/2))}px`);
    };

    // Measure on mount and resize
    measureSpacing();
    window.addEventListener('resize', measureSpacing);
    
    return () => window.removeEventListener('resize', measureSpacing);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 p-2 text-xs z-50 rounded">
      <div>Header Spacing Debug Active</div>
      <div>Check console for measurements</div>
    </div>
  );
};

export default HeaderSpacingTest;