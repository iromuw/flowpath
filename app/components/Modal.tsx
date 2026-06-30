'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
  scrollable?: boolean
  zIndex?: string
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidth = 'max-w-sm',
  scrollable = false,
  zIndex = 'z-50',
}: ModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/25 backdrop-blur-sm p-4`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth}${scrollable ? ' flex flex-col max-h-[90vh]' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-[rgba(26,101,90,0.15)]${scrollable ? ' flex-shrink-0' : ''}`}>
          <h2 className="text-sm font-semibold text-[#1A2520]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8AADA8] hover:text-[#1A2520] hover:bg-[#F1F3F4] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className={`px-6 py-5${scrollable ? ' overflow-y-auto flex-1' : ''}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`flex items-center justify-end gap-3 px-6 pt-4 pb-5 border-t border-[rgba(26,101,90,0.15)]${scrollable ? ' flex-shrink-0' : ''}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
