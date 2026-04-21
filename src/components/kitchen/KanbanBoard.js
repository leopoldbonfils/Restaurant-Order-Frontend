import React from 'react'
import KitchenOrderCard from './OrderCard'
import './KanbanBoard.css'

const COLUMNS = [
  {
    status: 'PENDING',
    label:  'New Orders',
    dot:    '#e05a2b',
    empty:  'No new orders',
  },
  {
    status: 'PREPARING',
    label:  'Preparing',
    dot:    '#3b82f6',
    empty:  'Nothing cooking',
  },
  {
    status: 'READY',
    label:  'Ready',
    dot:    '#22c55e',
    empty:  'Nothing ready yet',
  },
]

export default function KanbanBoard({ orders, onAdvance, counts }) {
  return (
    <div className="kos-kanban">
      {COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.status)
        return (
          <div key={col.status} className="kos-col">

            {/* Column header */}
            <div className="kos-col-header">
              <span className="kos-col-dot" style={{ background: col.dot }} />
              <span className="kos-col-title">{col.label}</span>
              <span className="kos-col-badge">{colOrders.length}</span>
            </div>

            {/* Cards */}
            <div className="kos-col-body">
              {colOrders.length === 0 ? (
                <div className="kos-col-empty">
                  <p>{col.empty}</p>
                </div>
              ) : (
                colOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onAdvance={onAdvance}
                  />
                ))
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}