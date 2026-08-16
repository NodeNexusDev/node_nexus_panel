import { useState, useRef, type ReactNode } from 'react'

interface DragDropListProps<T> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T) => string
  className?: string
}

export function DragDropList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  className = '',
}: DragDropListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const dragItem = useRef<T | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = items[index]
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    const newItems = [...items]
    const [removed] = newItems.splice(dragIndex, 1)
    newItems.splice(index, 0, removed)
    onReorder(newItems)
    setDragIndex(null)
    setOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setOverIndex(null)
    dragItem.current = null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`draggable ${dragIndex === index ? 'dragging' : ''} ${
            overIndex === index && dragIndex !== index ? 'drag-over' : ''
          }`}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
