import { PageShell } from '@/app/components/PageShell'

export default function CalendarPage() {
  return (
    <PageShell>
      {/* Topbar */}
      <div className="bg-white border-b border-[#e8e6e1] px-6 py-3.5 flex-shrink-0">
        <span className="text-base font-medium text-[#1c1c1a]">Calendar</span>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#f0eeeb] flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="4" width="18" height="16" rx="2" stroke="#6e6e6a" strokeWidth="1.5" />
            <path d="M7 2v4M15 2v4" stroke="#6e6e6a" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 9h18" stroke="#6e6e6a" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#1c1c1a]">Calendar coming soon</p>
          <p className="text-xs text-[#6e6e6a] mt-1">
            Track interview dates and follow-up reminders here.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
