'use client'

import { Modal } from './Modal'

interface Props {
  title: string
  subtitle?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDeleteModal({ title, subtitle, onConfirm, onCancel, loading }: Props) {
  return (
    <Modal
      title="Delete application?"
      onClose={onCancel}
      zIndex="z-[60]"
      footer={
        <>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-[#4A8C7E] hover:text-[#1A2520] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-[#1A2520]">
          <span className="font-medium">{title}</span>
          {subtitle && (
            <>
              <br />
              <span className="text-[#4A8C7E]">{subtitle}</span>
            </>
          )}
        </p>
        <p className="text-xs text-[#8AADA8]">
          This action cannot be undone. All status history will also be deleted.
        </p>
      </div>
    </Modal>
  )
}
