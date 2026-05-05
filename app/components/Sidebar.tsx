export function Sidebar() {
  return (
    <div className="w-14 flex-shrink-0 flex flex-col items-center py-4 gap-2 bg-white border-r border-[#e8e6e1]">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
        style={{ background: '#1a1a2e' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#fff" opacity="0.9" />
          <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#fff" opacity="0.5" />
          <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#fff" opacity="0.5" />
          <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#fff" opacity="0.3" />
        </svg>
      </div>

      <NavIcon active>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
          <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
      </NavIcon>

      <NavIcon>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavIcon>

      <NavIcon>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavIcon>

      <NavIcon>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1L2 5.3l4.2-.7L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </NavIcon>
    </div>
  )
}

function NavIcon({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
        active
          ? 'bg-[#f0eeeb] text-[#1c1c1a]'
          : 'text-[#b0aea8] hover:bg-[#f7f6f3] hover:text-[#6e6e6a]'
      }`}
    >
      {children}
    </div>
  )
}
