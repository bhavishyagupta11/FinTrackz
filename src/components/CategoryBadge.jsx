/**
 * CategoryBadge
 *
 * A reusable category tag that shows a tooltip with the category's tagline
 * on hover (desktop) or tap (mobile).
 *
 * Uses createPortal to render the tooltip on document.body so it always
 * escapes any overflow:hidden/auto parent (e.g. the table scroll wrapper).
 */
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { categoryTaglines } from '../data/mockData';

// Colour map — same palette used across the whole app
const BADGE_COLORS = {
  Food:          'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400',
  Shopping:      'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400',
  Travel:        'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400',
  Utilities:     'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  Entertainment: 'bg-pink-100   dark:bg-pink-900/30   text-pink-700   dark:text-pink-400',
  Health:        'bg-cyan-100   dark:bg-cyan-900/30   text-cyan-700   dark:text-cyan-400',
  Income:        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
};

// Small arrow pointing down from tooltip toward the badge
function Arrow() {
  return (
    <span
      className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-white dark:border-t-gray-800"
      style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.06))' }}
    />
  );
}

export default function CategoryBadge({ category, size = 'sm' }) {
  const [visible, setVisible]   = useState(false);
  const [coords,  setCoords]    = useState({ top: 0, left: 0 });
  const badgeRef                = useRef(null);
  const tagline                 = categoryTaglines[category];
  const colorClass              = BADGE_COLORS[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  const padding                 = size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  // Compute tooltip position from the badge's bounding rect (viewport-relative)
  const computeCoords = useCallback(() => {
    if (!badgeRef.current) return;
    const r = badgeRef.current.getBoundingClientRect();
    setCoords({
      // Place tooltip 10px above the badge, horizontally centred
      top:  r.top  - 10,
      left: r.left + r.width / 2,
    });
  }, []);

  // Desktop: hover
  function handleMouseEnter() {
    computeCoords();
    setVisible(true);
  }
  function handleMouseLeave() {
    setVisible(false);
  }

  // Mobile: tap to toggle (mouseenter/leave don't fire on touch)
  function handleClick(e) {
    e.stopPropagation();          // don't bubble to table row or parent
    if (visible) {
      setVisible(false);
    } else {
      computeCoords();
      setVisible(true);
    }
  }

  if (!tagline) {
    // No tagline for this category — render plain badge
    return (
      <span className={`inline-block text-xs font-medium rounded-full ${padding} ${colorClass}`}>
        {category}
      </span>
    );
  }

  return (
    <>
      {/* The badge itself */}
      <span
        ref={badgeRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`inline-block text-xs font-medium rounded-full cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${padding} ${colorClass}`}
      >
        {category}
      </span>

      {/* Tooltip — portalled to document.body to escape overflow containers */}
      {visible && createPortal(
        <div
          role="tooltip"
          className="animate-fade-slide pointer-events-none fixed z-[9999]"
          style={{
            top:       coords.top,
            left:      coords.left,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative max-w-[220px] rounded-xl px-3 py-2 text-xs leading-snug text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
            {tagline}
            <Arrow />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
