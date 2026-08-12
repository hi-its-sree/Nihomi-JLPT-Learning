import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Renders its children into document.body at a fixed screen position, instead
// of nesting them inside the trigger's own DOM subtree.
//
// Why: framer-motion applies an inline `transform` to every animated card, and
// `transform` creates a new CSS stacking context. A dropdown positioned inside
// one card (even with a high z-index) gets trapped in that card's stacking
// context and can end up rendered *underneath* a later sibling card in a grid.
// Portaling to <body> sidesteps the whole problem.
export default function FloatingMenu({ position, onClose, children }) {
  const menuRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  if (!position) return null

  return createPortal(
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        right: position.right,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 10,
        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
        zIndex: 1000,
        minWidth: 220,
        maxHeight: '70vh',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>,
    document.body,
  )
}
