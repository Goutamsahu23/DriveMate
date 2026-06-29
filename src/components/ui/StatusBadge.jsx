import { RIDE_STATUS } from '../../lib/constants'

const colorMap = {
  volt: 'bg-volt/10 text-volt border-volt/20',
  iris: 'bg-iris/10 text-iris border-iris/20',
  coral: 'bg-coral/10 text-coral border-coral/20',
}

export default function StatusBadge({ status, size = 'md' }) {
  const config = RIDE_STATUS[status] || { label: status, color: 'volt', dot: 'bg-volt' }
  const sizeClass = size === 'sm' ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3.5 py-1.5'

  return (
    <span className={`inline-flex items-center gap-2 font-mono uppercase tracking-wider border rounded-full ${colorMap[config.color]} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  )
}
