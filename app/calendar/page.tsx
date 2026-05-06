import { PageShell } from '@/app/components/PageShell'

export default function CalendarPage() {
  return (
    <PageShell>
      {/* Topbar */}
      <div className="bg-white border-b border-[rgba(26,101,90,0.15)] px-6 py-3.5 flex-shrink-0">
        <span className="text-base font-medium text-[#1A2520]">Calendar</span>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="4" width="18" height="16" rx="2" stroke="#4A8C7E" strokeWidth="1.5" />
            <path d="M7 2v4M15 2v4" stroke="#4A8C7E" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 9h18" stroke="#4A8C7E" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#1A2520]">Calendar coming soon</p>
          <p className="text-xs text-[#4A8C7E] mt-1">
            Track interview dates and follow-up reminders here.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
