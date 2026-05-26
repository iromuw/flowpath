'use client'

interface Props {
  title: string
  subtitle?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDeleteModal({ title, subtitle, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Warning icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#F5E8E8] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#C0392B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>

        <h2 className="text-base font-semibold text-[#1A2520] text-center">Delete application?</h2>

        <p className="mt-2 text-sm text-center text-[#4A8C7E]">
          <span className="font-medium text-[#1A2520]">{title}</span>
          {subtitle && <><br />{subtitle}</>}
        </p>

        <p className="mt-3 text-xs text-center text-[#8AADA8]">
          This action cannot be undone. All status history will also be deleted.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-[#1A6B5A] border border-[rgba(26,101,90,0.25)] rounded-xl hover:bg-[#E6F4F1] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#C0392B] rounded-xl hover:bg-[#A93226] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
