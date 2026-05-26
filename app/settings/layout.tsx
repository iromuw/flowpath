import { PageShell } from '@/app/components/PageShell'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      <div className="bg-white border-b border-[rgba(26,101,90,0.15)] px-6 py-3.5 flex-shrink-0">
        <span className="text-base font-medium text-[#1A2520]">Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </PageShell>
  )
}
