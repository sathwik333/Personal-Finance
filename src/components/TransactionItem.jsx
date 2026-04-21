import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/utils'
import CategoryBadge from './CategoryBadge'

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const { amount, type, note, date, categories } = transaction
  const isIncome = type === 'income'

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="text-2xl" aria-hidden="true">{categories?.icon ?? '📦'}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CategoryBadge category={categories} />
        </div>
        {note && <p className="text-sm text-gray-400 truncate mt-0.5">{note}</p>}
        <p className="text-xs text-gray-500 mt-0.5">{formatDate(date)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <div className="flex gap-2 justify-end mt-1">
          <button onClick={() => onEdit(transaction)} aria-label="Edit transaction" className="text-gray-600 hover:text-white transition-colors">
            <Pencil size={14} aria-hidden="true" />
          </button>
          <button onClick={() => onDelete(transaction.id)} aria-label="Delete transaction" className="text-gray-600 hover:text-expense transition-colors">
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
