import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/utils'
import CategoryBadge from './CategoryBadge'

export default function TransactionItem({ transaction, onEdit, onDelete, animDelay = 0 }) {
  const { amount, type, note, date, categories } = transaction
  const isIncome = type === 'income'

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 group transition-colors duration-150 hover:bg-white/[0.03] animate-fade-up"
      style={{ animationDelay: `${animDelay}ms`, animationFillMode: 'both' }}
    >
      {/* Category icon circle */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{
          background: categories?.color ? categories.color + '22' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${categories?.color ? categories.color + '33' : 'rgba(255,255,255,0.08)'}`,
        }}
        aria-hidden="true"
      >
        {categories?.icon ?? '📦'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CategoryBadge category={categories} />
        </div>
        {note && (
          <p className="text-xs text-gray-500 truncate mt-0.5 font-body">{note}</p>
        )}
        <p className="text-xs text-gray-600 mt-0.5 font-body">{formatDate(date)}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`font-bold text-sm tabular-nums ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <div className="flex gap-1.5 justify-end mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(transaction)}
            aria-label="Edit transaction"
            className="text-gray-600 hover:text-white transition-colors p-0.5 cursor-pointer"
          >
            <Pencil size={13} aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            aria-label="Delete transaction"
            className="text-gray-600 hover:text-expense transition-colors p-0.5 cursor-pointer"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
