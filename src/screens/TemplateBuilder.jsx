import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  IconGripVertical,
  IconX,
  IconPlus,
  IconLoader2,
  IconCheck,
  IconExternalLink,
} from '@tabler/icons-react'
import { Textarea } from '../components/Input'
import { SectionLabel } from '../components/Card'
import { BuilderIllustration } from '../components/EmptyState'
import { useWindowWidth } from '../hooks/useWindowWidth'

let _subId = 0

function SortableSubitem({ item, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        style={{
          cursor: 'grab',
          color: 'var(--text-muted)',
          border: 'none',
          background: 'none',
          padding: '0 2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <IconGripVertical size={14} />
      </button>
      <input
        type="text"
        value={item.name}
        onChange={(e) => onEdit(item.id, e.target.value)}
        style={{
          flex: 1,
          height: 36,
          fontSize: 14,
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '0 12px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 120ms, box-shadow 120ms',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px rgba(108,71,255,0.12)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100"
        style={{
          color: 'var(--text-muted)',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '0 2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          transition: 'opacity 120ms',
        }}
      >
        <IconX size={14} />
      </button>
    </div>
  )
}

const MOCK_SUBITEMS = [
  'Define target audience and goals',
  'Create content calendar',
  'Design visual assets',
  'Write copy for all platforms',
  'Schedule and publish posts',
  'Monitor engagement and analytics',
  'Compile performance report',
]

export default function TemplateBuilder() {
  const width = useWindowWidth()
  const isMobile = width > 0 && width < 640

  const [prompt, setPrompt] = useState('')
  const [generationState, setGenerationState] = useState('idle')
  const [subitems, setSubitems] = useState([])
  const [confirmState, setConfirmState] = useState('idle')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerationState('loading')
    await new Promise((r) => setTimeout(r, 1800))
    setSubitems(MOCK_SUBITEMS.map((name) => ({ id: ++_subId, name })))
    setGenerationState('done')
  }

  const handleRegenerate = async () => {
    setGenerationState('loading')
    await new Promise((r) => setTimeout(r, 1200))
    setSubitems(MOCK_SUBITEMS.slice(0, 5).reverse().map((name) => ({ id: ++_subId, name })))
    setGenerationState('done')
  }

  const handleConfirm = async () => {
    setConfirmState('loading')
    await new Promise((r) => setTimeout(r, 1200))
    setConfirmState('done')
  }

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setSubitems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const editSubitem = (id, name) => {
    setSubitems((prev) => prev.map((s) => s.id === id ? { ...s, name } : s))
  }

  const deleteSubitem = (id) => {
    setSubitems((prev) => prev.filter((s) => s.id !== id))
  }

  const addSubitem = () => {
    setSubitems((prev) => [...prev, { id: ++_subId, name: '' }])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ padding: isMobile ? '16px' : '20px 24px' }}
    >
      <div className="mb-5">
        <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Template Builder
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          Describe a task type and AI will generate a subitem checklist for it.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', alignItems: 'start' }}>
        {/* Left column */}
        <div className="flex flex-col gap-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create a social media campaign for a product launch"
            minHeight={120}
            disabled={generationState === 'loading'}
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generationState === 'loading' || !prompt.trim()}
            style={{
              width: '100%',
              height: 34,
              borderRadius: 8,
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              cursor: generationState === 'loading' || !prompt.trim() ? 'not-allowed' : 'pointer',
              opacity: !prompt.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit',
            }}
          >
            {generationState === 'loading' && <IconLoader2 size={14} className="animate-spin" />}
            {generationState === 'loading' ? 'Generating...' : 'Generate subitems'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            Powered by monday.com AI Blocks. Uses AI credits from your workspace.
          </p>
        </div>

        {/* Right column */}
        <div>
          {generationState === 'idle' ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-[10px]"
              style={{ border: '1px dashed var(--border)' }}
            >
              <BuilderIllustration />
              <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                Your generated subitems will appear here
              </p>
            </div>
          ) : generationState === 'loading' ? (
            <div
              className="flex flex-col gap-2 p-4 rounded-[10px]"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer rounded" style={{ height: 36, borderRadius: 8 }} />
              ))}
            </div>
          ) : confirmState === 'done' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-6 rounded-[10px]"
              style={{ backgroundColor: 'var(--success-light)', border: '1px solid rgba(15,155,110,0.2)' }}
            >
              <div
                className="flex items-center justify-center mb-3"
                style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--success)' }}
              >
                <IconCheck size={20} color="#fff" />
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Template created on your template board
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                {subitems.length} subitems added to "Generated Template"
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                Open in monday.com <IconExternalLink size={11} />
              </a>
            </motion.div>
          ) : (
            <div
              className="rounded-[10px] p-4"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
            >
              <SectionLabel>Generated Subitems</SectionLabel>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={subitems.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2 mb-3">
                    {subitems.map((item) => (
                      <SortableSubitem
                        key={item.id}
                        item={item}
                        onEdit={editSubitem}
                        onDelete={deleteSubitem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <button
                type="button"
                onClick={addSubitem}
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}
              >
                <IconPlus size={14} />
                Add subitem
              </button>

              <div className="flex gap-2 mt-4" style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={confirmState === 'loading'}
                  style={{
                    flex: 1,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontFamily: 'inherit',
                  }}
                >
                  {confirmState === 'loading' && <IconLoader2 size={14} className="animate-spin" />}
                  {confirmState === 'loading' ? 'Creating...' : 'Confirm & create template'}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  style={{
                    height: 34,
                    paddingInline: 16,
                    borderRadius: 8,
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontWeight: 500,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
