'use client';

import { useState, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/helpers';
import type { ReactNode } from 'react';

interface SortableItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

function SortableItem({ id, children, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={cn('relative', isDragging && 'z-50 opacity-80')} {...attributes}>
      <div className={cn('absolute left-0 top-2 z-10 -ml-8 hidden cursor-grab active:cursor-grabbing lg:block', className)} {...listeners}>
        <GripVertical className="h-4 w-4 text-text-tertiary" />
      </div>
      {children}
    </div>
  );
}

interface DashboardGridProps {
  children: ReactNode;
  storageKey: string;
}

export function DashboardGrid({ children, storageKey }: DashboardGridProps) {
  const [items, setItems] = useState<string[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [storageKey]);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, storageKey]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const newItems = [...prev];
      newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, active.id as string);
      return newItems;
    });
  }

  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            isCustomizing ? 'bg-accent-blue text-white' : 'border border-border-default text-text-secondary hover:bg-bg-hover',
          )}
        >
          {isCustomizing ? 'Done Customizing' : 'Customize Layout'}
        </button>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={items.length > 0 ? items : childArray.map((_, i) => `widget-${i}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {childArray.map((child, i) => (
              <SortableItem key={items[i] || `widget-${i}`} id={items[i] || `widget-${i}`}>
                <div className={cn(isCustomizing && 'rounded-lg border border-dashed border-border-hover p-4')}>
                  {child}
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
