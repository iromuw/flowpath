'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Info, X, Trash2, MoreVertical, Pencil } from 'lucide-react'
import { Modal } from '@/app/components/Modal'
import { toast } from 'sonner'
import type { Campaign } from '@/lib/types'
import { useCampaign } from '@/app/contexts/CampaignContext'
import {
  createCampaignAction,
  renameCampaignAction,
  archiveCampaignAction,
  restoreCampaignAction,
  setActiveCampaignAction,
  deactivateCampaignAction,
  deleteCampaignAction,
} from './actions'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function dateRange(started: string, ended: string | null) {
  return ended ? `${fmtDate(started)} – ${fmtDate(ended)}` : `Started ${fmtDate(started)}`
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

function Toggle({
  active,
  onToggle,
  disabled,
}: {
  active: boolean
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      disabled={disabled}
      title={active ? 'Deactivate' : 'Activate'}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none disabled:opacity-60 cursor-pointer ${
        active ? 'bg-[#0FA878]' : 'bg-[#D1D5DB]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          active ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Kebab menu (Rename / Delete)
// ---------------------------------------------------------------------------

function KebabMenu({
  onRename,
  onDelete,
}: {
  onRename: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open, close])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        onPointerDown={(e) => e.stopPropagation()}
        title="More options"
        className="w-6 h-6 flex items-center justify-center rounded text-[#8AADA8] hover:text-[#1A2520] hover:bg-[#F1F3F4] transition-colors cursor-pointer"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[rgba(26,101,90,0.12)] py-1 w-32 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); close(); onRename() }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A2520] hover:bg-[#F1F3F4] transition-colors cursor-pointer"
          >
            <Pencil size={12} className="text-[#4A8C7E]" />
            Rename
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); close(); onDelete() }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#C0392B] hover:bg-[#F5E8E8] transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Campaign card — "My Campaigns" zone (sortable)
// ---------------------------------------------------------------------------

interface ActiveCardProps {
  campaign: Campaign
  isAnimating: boolean
  isPending: boolean
  onToggle: (campaign: Campaign) => void
  onRename: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}

function ActiveCampaignCard({
  campaign,
  isAnimating,
  isPending,
  onToggle,
  onRename,
  onDelete,
}: ActiveCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: campaign.id,
    data: { zone: 'my-campaigns' },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    ...(isAnimating ? { animation: 'cardLand 0.25s ease-out' } : {}),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-[rgba(26,101,90,0.15)] rounded-xl p-4 flex items-center gap-3 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A2520] truncate">{campaign.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-[#8AADA8]">{dateRange(campaign.started_at, campaign.ended_at)}</p>
          {campaign.is_active && (
            <span className="text-[10px] bg-[#E6F4F1] text-[#0A7A56] px-1.5 py-0.5 rounded font-medium">
              Active
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Toggle active={campaign.is_active} onToggle={() => onToggle(campaign)} disabled={isPending} />
        <KebabMenu onRename={() => onRename(campaign)} onDelete={() => onDelete(campaign)} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Campaign card — "Archived" zone (sortable, muted)
// ---------------------------------------------------------------------------

function ArchivedCampaignCard({
  campaign,
  isAnimating,
  onRename,
  onDelete,
}: {
  campaign: Campaign
  isAnimating: boolean
  onRename: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: campaign.id,
    data: { zone: 'archived' },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 0.5,
    ...(isAnimating ? { animation: 'cardLand 0.25s ease-out' } : {}),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-[rgba(26,101,90,0.10)] rounded-xl p-4 cursor-grab active:cursor-grabbing select-none flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#4A8C7E] truncate">{campaign.name}</p>
        <p className="text-xs text-[#8AADA8] mt-0.5">{dateRange(campaign.started_at, campaign.ended_at)}</p>
      </div>
      <KebabMenu onRename={() => onRename(campaign)} onDelete={() => onDelete(campaign)} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drop placeholder
// ---------------------------------------------------------------------------

function DropPlaceholder() {
  return (
    <div className="border-2 border-dashed border-[#0FA878]/40 rounded-xl p-4 h-[76px] bg-[#E6F4F1]/30" />
  )
}

// ---------------------------------------------------------------------------
// Drag overlay card (follows the pointer)
// ---------------------------------------------------------------------------

function DragOverlayCard({ campaign }: { campaign: Campaign }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-xl border border-[rgba(26,101,90,0.20)] cursor-grabbing select-none rotate-1">
      <p className="text-sm font-medium text-[#1A2520] truncate">{campaign.name}</p>
      <p className="text-xs text-[#8AADA8] mt-0.5">
        {dateRange(campaign.started_at, campaign.ended_at)}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Droppable zone
// ---------------------------------------------------------------------------

function DroppableZone({
  id,
  label,
  count,
  isEmpty,
  children,
}: {
  id: string
  label: string
  count: number
  isEmpty: boolean
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[220px] rounded-xl border-2 transition-all duration-150 p-4 ${
        isOver
          ? 'border-[#0FA878] bg-[#E6F4F1]/50'
          : 'border-[rgba(26,101,90,0.12)] bg-[#F9FCFB]'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-semibold text-[#4A8C7E] uppercase tracking-wide">{label}</h3>
        <span className="text-xs text-[#8AADA8] bg-white border border-[rgba(26,101,90,0.15)] rounded px-1.5 py-0.5 font-medium">
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {children}
        {isOver && <DropPlaceholder />}
      </div>
      {isEmpty && !isOver && (
        <p className="text-center text-xs text-[#8AADA8] py-6">
          {id === 'my-campaigns' ? 'No campaigns yet' : 'No archived campaigns'}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// New campaign modal
// ---------------------------------------------------------------------------

function NewCampaignModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      await onCreate(trimmed)
      onClose()
    } catch {
      setError('Failed to create campaign')
      setLoading(false)
    }
  }

  return (
    <Modal
      title="New Campaign"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#4A8C7E] hover:text-[#1A2520] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-campaign-form"
            disabled={loading || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Create
          </button>
        </>
      }
    >
      <form id="new-campaign-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            placeholder="e.g. Summer 2026 Job Search"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[rgba(26,101,90,0.15)] bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent transition-colors"
          />
        </div>
        {error && (
          <p className="text-xs text-[#C0392B] bg-[#F5E8E8] px-3 py-2 rounded-lg">{error}</p>
        )}
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Rename campaign modal
// ---------------------------------------------------------------------------

function RenameCampaignModal({
  campaign,
  onClose,
  onRename,
}: {
  campaign: Campaign
  onClose: () => void
  onRename: (name: string) => Promise<void>
}) {
  const [name, setName] = useState(campaign.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === campaign.name) { onClose(); return }
    setLoading(true)
    setError(null)
    try {
      await onRename(trimmed)
      onClose()
    } catch {
      setError('Failed to rename campaign')
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Rename Campaign"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#4A8C7E] hover:text-[#1A2520] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="rename-campaign-form"
            disabled={loading || !name.trim() || name.trim() === campaign.name}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Save
          </button>
        </>
      }
    >
      <form id="rename-campaign-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#4A8C7E] mb-1.5">Name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[rgba(26,101,90,0.15)] bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent transition-colors"
          />
        </div>
        {error && (
          <p className="text-xs text-[#C0392B] bg-[#F5E8E8] px-3 py-2 rounded-lg">{error}</p>
        )}
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Confirm dialog
// ---------------------------------------------------------------------------

function ConfirmDialog({
  onCancel,
  onConfirm,
  isPending,
}: {
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <Modal
      title="Switch active campaign?"
      onClose={onCancel}
      footer={
        <>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#4A8C7E] hover:text-[#1A2520] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
          >
            {isPending && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Continue
          </button>
        </>
      }
    >
      <p className="text-sm text-[#4A8C7E]">This will end your current campaign. Continue?</p>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Delete campaign modal
// ---------------------------------------------------------------------------

function DeleteCampaignModal({
  campaign,
  allCampaigns,
  onClose,
  onConfirm,
  isPending,
}: {
  campaign: Campaign
  allCampaigns: Campaign[]
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  const [confirmText, setConfirmText] = useState('')

  const isOnlyCampaign = allCampaigns.length === 1
  const otherNonArchived = allCampaigns.filter((c) => !c.is_archived && c.id !== campaign.id)
  const isOnlyActive = campaign.is_active && otherNonArchived.length === 0
  const isBlocked = isOnlyCampaign || isOnlyActive

  const blockMessage = isOnlyCampaign
    ? 'At least one campaign must exist. Create a new campaign before deleting this one.'
    : 'This is your only active campaign. You must have at least one active campaign.'

  const canConfirm = !isBlocked && confirmText === campaign.name

  return (
    <Modal
      title="Delete Campaign"
      onClose={onClose}
      footer={
        isBlocked ? (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#4A8C7E] hover:text-[#1A2520] transition-colors cursor-pointer"
          >
            Got it
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#4A8C7E] hover:text-[#1A2520] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!canConfirm || isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C0392B] rounded-lg hover:bg-[#A93226] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              {isPending && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Delete
            </button>
          </>
        )
      }
    >
      {isBlocked ? (
        <p className="text-sm text-[#1A2520] leading-relaxed">{blockMessage}</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#1A2520] leading-relaxed">
            Deleting <strong>{campaign.name}</strong> will permanently remove all associated
            applications and data. This action cannot be undone.
          </p>
          <div>
            <label className="block text-xs font-medium text-[#1A2520] mb-2">
              Type <strong>{campaign.name}</strong> to confirm
            </label>
            <input
              autoFocus
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={campaign.name}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[rgba(26,101,90,0.15)] bg-[#E6F4F1] text-[#1A2520] placeholder:text-[#8AADA8] focus:outline-none focus:ring-2 focus:ring-[#0FA878]/30 focus:border-transparent transition-colors"
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Main board
// ---------------------------------------------------------------------------

export function CampaignsBoardClient({
  initialCampaigns,
  openNewModal = false,
}: {
  initialCampaigns: Campaign[]
  openNewModal?: boolean
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [justMovedId, setJustMovedId] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [confirmActivate, setConfirmActivate] = useState<Campaign | null>(null)
  const [renamingCampaign, setRenamingCampaign] = useState<Campaign | null>(null)
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { refreshCampaigns, setActiveCampaign } = useCampaign()
  const router = useRouter()

  useEffect(() => {
    if (openNewModal) {
      setShowNewModal(true)
      router.replace('/settings/campaigns')
    }
  }, [openNewModal, router])

  // Saved snapshot before each drag, used to revert on server error
  const snapshotRef = useRef<Campaign[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const myCampaigns = campaigns
    .filter((c) => !c.is_archived)
    .sort((a, b) => Number(b.is_active) - Number(a.is_active))
  const archivedCampaigns = campaigns.filter((c) => c.is_archived)
  const activeDragCampaign = activeDragId ? campaigns.find((c) => c.id === activeDragId) ?? null : null

  // -------------------------------------------------------------------------
  // Drag handlers
  // -------------------------------------------------------------------------

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string)
    snapshotRef.current = campaigns
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDragId(null)

    if (!over) return

    const draggedCampaign = snapshotRef.current.find((c) => c.id === active.id)
    if (!draggedCampaign) return

    const sourceZone = draggedCampaign.is_archived ? 'archived' : 'my-campaigns'
    const targetZone = over.id as string

    if (sourceZone === targetZone) return

    const snapshot = snapshotRef.current

    if (targetZone === 'archived') {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === draggedCampaign.id ? { ...c, is_archived: true, is_active: false } : c,
        ),
      )
      flashMove(draggedCampaign.id)
      startTransition(async () => {
        const result = await archiveCampaignAction(draggedCampaign.id)
        if (result.error) {
          setCampaigns(snapshot)
          setError(result.error)
        }
      })
    } else if (targetZone === 'my-campaigns') {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === draggedCampaign.id ? { ...c, is_archived: false } : c)),
      )
      flashMove(draggedCampaign.id)
      startTransition(async () => {
        const result = await restoreCampaignAction(draggedCampaign.id)
        if (result.error) {
          setCampaigns(snapshot)
          setError(result.error)
        }
      })
    }
  }

  function flashMove(id: string) {
    setJustMovedId(id)
    setTimeout(() => setJustMovedId(null), 350)
  }

  // -------------------------------------------------------------------------
  // Toggle active
  // -------------------------------------------------------------------------

  function handleToggle(campaign: Campaign) {
    if (campaign.is_active) {
      const snapshot = campaigns
      const now = new Date().toISOString()
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id ? { ...c, is_active: false, ended_at: now } : c,
        ),
      )
      startTransition(async () => {
        const result = await deactivateCampaignAction(campaign.id)
        if (result.error) {
          setCampaigns(snapshot)
          setError(result.error)
        } else {
          await refreshCampaigns()
        }
      })
    } else {
      const currentActive = campaigns.find((c) => c.is_active && !c.is_archived)
      if (currentActive) {
        setConfirmActivate(campaign)
      } else {
        performActivate(campaign)
      }
    }
  }

  function performActivate(campaign: Campaign) {
    const snapshot = campaigns
    const now = new Date().toISOString()
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        is_active: c.id === campaign.id,
        ended_at: c.id === campaign.id ? null : c.is_active ? now : c.ended_at,
      })),
    )
    startTransition(async () => {
      const result = await setActiveCampaignAction(campaign.id)
      if (result.error) {
        setCampaigns(snapshot)
        setError(result.error)
      } else {
        await refreshCampaigns()
      }
    })
  }

  function handleConfirmActivate() {
    if (!confirmActivate) return
    const target = confirmActivate
    setConfirmActivate(null)
    performActivate(target)
  }

  // -------------------------------------------------------------------------
  // Rename campaign
  // -------------------------------------------------------------------------

  async function handleRename(name: string) {
    if (!renamingCampaign) return
    const target = renamingCampaign
    const snapshot = campaigns
    setCampaigns((prev) => prev.map((c) => (c.id === target.id ? { ...c, name } : c)))
    const result = await renameCampaignAction(target.id, name)
    if (result.error) {
      setCampaigns(snapshot)
      throw new Error(result.error)
    }
  }

  // -------------------------------------------------------------------------
  // Create campaign
  // -------------------------------------------------------------------------

  async function handleCreate(name: string) {
    const result = await createCampaignAction(name)
    if (result.error) throw new Error(result.error)
    if (result.data) {
      const newCampaign = result.data
      setCampaigns((prev) => [
        newCampaign,
        ...prev.map((c) => ({ ...c, is_active: false })),
      ])
      setActiveCampaign(newCampaign)
      await refreshCampaigns()
      toast.success(`Switched to campaign: ${newCampaign.name}`)
    }
  }

  // -------------------------------------------------------------------------
  // Delete campaign
  // -------------------------------------------------------------------------

  async function handleDeleteConfirm() {
    if (!deletingCampaign) return
    const target = deletingCampaign
    setDeletingCampaign(null)
    startTransition(async () => {
      const result = await deleteCampaignAction(target.id)
      if (result.error) {
        setError(result.error)
      } else {
        setCampaigns((prev) => prev.filter((c) => c.id !== target.id))
        if (result.data?.newActiveCampaign) {
          const next = result.data.newActiveCampaign
          setCampaigns((prev) =>
            prev.map((c) => (c.id === next.id ? next : { ...c, is_active: false })),
          )
          setActiveCampaign(next)
        }
        await refreshCampaigns()
        toast.success(`Campaign "${target.name}" has been deleted`)
      }
    })
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <style>{`
        @keyframes cardLand {
          from { opacity: 0.7; transform: scale(0.97) translateY(-6px); }
          to   { opacity: 1;   transform: scale(1)    translateY(0); }
        }
      `}</style>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between px-4 py-3 bg-[#F5E8E8] border border-[#C0392B]/20 rounded-xl text-sm text-[#C0392B]">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 hover:opacity-70 flex items-center cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        {/* Info banner */}
        <div className="flex items-start gap-2.5 bg-[#E6F4F1] border border-[rgba(26,101,90,0.15)] rounded-xl px-4 py-2.5 flex-1 mr-4">
          <Info size={13} className="text-[#4A8C7E] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#4A8C7E] leading-relaxed">
            Drag campaigns to <strong>Archived</strong> to hide them from your sidebar. Drag them
            back to restore.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0FA878] rounded-lg hover:bg-[#0D9068] transition-colors flex-shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          New campaign
        </button>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* My Campaigns zone */}
          <DroppableZone
            id="my-campaigns"
            label="My Campaigns"
            count={myCampaigns.length}
            isEmpty={myCampaigns.length === 0}
          >
            <SortableContext
              items={myCampaigns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {myCampaigns.map((c) => (
                <ActiveCampaignCard
                  key={c.id}
                  campaign={c}
                  isAnimating={justMovedId === c.id}
                  isPending={isPending}
                  onToggle={handleToggle}
                  onRename={setRenamingCampaign}
                  onDelete={setDeletingCampaign}
                />
              ))}
            </SortableContext>
          </DroppableZone>

          {/* Archived zone */}
          <DroppableZone
            id="archived"
            label="Archived"
            count={archivedCampaigns.length}
            isEmpty={archivedCampaigns.length === 0}
          >
            <SortableContext
              items={archivedCampaigns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {archivedCampaigns.map((c) => (
                <ArchivedCampaignCard
                  key={c.id}
                  campaign={c}
                  isAnimating={justMovedId === c.id}
                  onRename={setRenamingCampaign}
                  onDelete={setDeletingCampaign}
                />
              ))}
            </SortableContext>
          </DroppableZone>
        </div>

        <DragOverlay>
          {activeDragCampaign && <DragOverlayCard campaign={activeDragCampaign} />}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {showNewModal && (
        <NewCampaignModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
      {renamingCampaign && (
        <RenameCampaignModal
          campaign={renamingCampaign}
          onClose={() => setRenamingCampaign(null)}
          onRename={handleRename}
        />
      )}
      {confirmActivate && (
        <ConfirmDialog
          onCancel={() => setConfirmActivate(null)}
          onConfirm={handleConfirmActivate}
          isPending={isPending}
        />
      )}
      {deletingCampaign && (
        <DeleteCampaignModal
          campaign={deletingCampaign}
          allCampaigns={campaigns}
          onClose={() => setDeletingCampaign(null)}
          onConfirm={handleDeleteConfirm}
          isPending={isPending}
        />
      )}
    </>
  )
}
