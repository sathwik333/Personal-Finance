export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return <span className="text-gray-500 text-sm">Uncategorized</span>
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
      style={{ backgroundColor: category.color + '22', color: category.color }}
    >
      {category.icon} {category.name}
    </span>
  )
}
