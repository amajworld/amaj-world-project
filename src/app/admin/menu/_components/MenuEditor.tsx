
'use client';

import React, { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Grip, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { MenuItem } from '../page';

// Helper to reorder
const reorder = (
  list: any[],
  startIndex: number,
  endIndex: number
): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Helper to move items between lists
const move = (
  source: any[],
  destination: any[],
  droppableSource: any,
  droppableDestination: any
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return {
    [droppableSource.droppableId]: sourceClone,
    [droppableDestination.droppableId]: destClone,
  };
};

const MenuEditor = ({
  initialItems,
  onSave,
}: {
  initialItems: MenuItem[];
  onSave: (items: MenuItem[]) => Promise<void>;
}) => {
  const [items, setItems] = useState(initialItems);
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [saving, setSaving] = useState(false);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const sourceParentId = source.droppableId;
    const destParentId = destination.droppableId;

    if (sourceParentId === destParentId) {
      // Reordering in the same list
      if (sourceParentId === 'main') {
        const reorderedItems = reorder(items, source.index, destination.index);
        setItems(reorderedItems as MenuItem[]);
      } else {
        const parentIndex = items.findIndex((p) => p.id === sourceParentId);
        if (parentIndex > -1) {
          const newItems = [...items];
          const reorderedChildren = reorder(
            newItems[parentIndex].children || [],
            source.index,
            destination.index
          );
          newItems[parentIndex].children = reorderedChildren as MenuItem[];
          setItems(newItems);
        }
      }
    } else {
      // Moving from one list to another
      let sourceList;
      let destList;
      let movedItem;

      const sourceParent = items.find((p) => p.id === sourceParentId);
      
      if(sourceParentId === 'main') {
          sourceList = [...items];
      } else {
          sourceList = sourceParent?.children ? [...sourceParent.children] : [];
      }

      movedItem = sourceList.find(i => i.id === draggableId);

      const [removed] = sourceList.splice(source.index, 1);

      const destParent = items.find((p) => p.id === destParentId);
      if(destParentId === 'main') {
          destList = [...items];
          if(movedItem) destList.splice(destination.index, 0, {...movedItem, children: movedItem.children || undefined});
      } else {
         if (destParent) {
            destList = destParent.children ? [...destParent.children] : [];
            if(movedItem) destList.splice(destination.index, 0, {...movedItem, children: undefined}); // Can't move group into another group
         } else {
            return;
         }
      }

      const newItems = [...items];
      const sourceParentIndex = newItems.findIndex(p => p.id === sourceParentId);
      const destParentIndex = newItems.findIndex(p => p.id === destParentId);
      
      if(sourceParentId === 'main') {
        const updatedItems = newItems.filter(i => i.id !== draggableId);
        if(destParentIndex > -1) {
            if (!updatedItems[destParentIndex].children) {
                updatedItems[destParentIndex].children = [];
            }
            if(movedItem) updatedItems[destParentIndex].children?.splice(destination.index, 0, {...movedItem, children: undefined});
        }
        setItems(updatedItems);
      } else if (destParentId === 'main') {
        if(sourceParentIndex > -1) {
            newItems[sourceParentIndex].children = sourceList as MenuItem[];
        }
        if(movedItem) newItems.splice(destination.index, 0, movedItem);
        setItems(newItems);
      } else { // parent to parent
        if (sourceParentIndex > -1) {
            newItems[sourceParentIndex].children = sourceList as MenuItem[];
        }
        if (destParentIndex > -1) {
             if (!newItems[destParentIndex].children) {
                newItems[destParentIndex].children = [];
            }
            if(movedItem) newItems[destParentIndex].children?.splice(destination.index, 0, {...movedItem, children: undefined});
        }
        setItems(newItems);
      }
    }
  };

  const handleAddItem = (parentId: string | null = null) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: 'New Item',
      href: '/',
    };
    if (parentId) {
      const parentIndex = items.findIndex((p) => p.id === parentId);
      if (parentIndex > -1) {
        const newItems = [...items];
        if (!newItems[parentIndex].children) {
          newItems[parentIndex].children = [];
        }
        newItems[parentIndex].children!.push(newItem);
        setItems(newItems);
      }
    } else {
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (id: string, parentId: string | null = null) => {
    if (parentId) {
      const parentIndex = items.findIndex((p) => p.id === parentId);
      if (parentIndex > -1) {
        const newItems = [...items];
        newItems[parentIndex].children = newItems[
          parentIndex
        ].children?.filter((child) => child.id !== id);
        setItems(newItems);
      }
    } else {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleUpdateItem = (
    id: string,
    field: 'label' | 'href',
    value: string,
    parentId: string | null = null
  ) => {
    const newItems = [...items];
    let itemToUpdate;
    if (parentId) {
      const parent = newItems.find((p) => p.id === parentId);
      itemToUpdate = parent?.children?.find((c) => c.id === id);
    } else {
      itemToUpdate = newItems.find((i) => i.id === id);
    }
    if (itemToUpdate) {
      itemToUpdate[field] = value;
      setItems(newItems);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
        await onSave(items);
        alert('Menu saved successfully!');
    } catch (e) {
        alert('Failed to save menu.');
        console.error(e);
    } finally {
        setSaving(false);
    }
  }

  const renderItem = (item: MenuItem, index: number, parentId: string | null = null) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 rounded-lg bg-background ${snapshot.isDragging ? 'shadow-lg' : ''}`}
        >
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <div {...provided.dragHandleProps} className="cursor-move p-1">
              <Grip size={20} />
            </div>
            
            {item.children !== undefined && (
                <Button variant="ghost" size="icon" onClick={() => setOpenItems(prev => ({...prev, [item.id]: !prev[item.id]}))}>
                    {openItems[item.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </Button>
            )}

            <Input
              value={item.label}
              onChange={(e) =>
                handleUpdateItem(item.id, 'label', e.target.value, parentId)
              }
              className="flex-1"
            />
            <Input
              value={item.href}
              onChange={(e) =>
                handleUpdateItem(item.id, 'href', e.target.value, parentId)
              }
              className="flex-1"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveItem(item.id, parentId)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          {item.children !== undefined && openItems[item.id] && (
            <div className="pl-8 pt-2">
                <Droppable droppableId={item.id} type="item">
                    {(provided, snapshot) => (
                         <div ref={provided.innerRef} {...provided.droppableProps} className={`p-2 border-dashed border-2 rounded-md ${snapshot.isDraggingOver ? 'bg-secondary' : ''}`}>
                            {item.children!.map((child, childIndex) => renderItem(child, childIndex, item.id))}
                            {provided.placeholder}
                         </div>
                    )}
                </Droppable>
                 <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddItem(item.id)}>
                    <Plus size={16} className="mr-2" /> Add Sub-Item
                </Button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <Card>
            <CardContent className="p-6">
                <Droppable droppableId="main" type="item">
                    {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`p-4 rounded-lg border-2 border-dashed ${snapshot.isDraggingOver ? 'bg-secondary' : 'bg-transparent'}`}>
                        {items.map((item, index) => renderItem(item, index))}
                        {provided.placeholder}
                    </div>
                    )}
                </Droppable>
                <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => handleAddItem()}>
                    <Plus size={16} className="mr-2" /> Add Menu Item
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Menu'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </DragDropContext>
  );
};

export default MenuEditor;
