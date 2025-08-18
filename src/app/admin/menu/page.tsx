
'use client';

import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Trash2, GripVertical, Plus, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDocument, updateDocument } from '@/app/actions/firestoreActions';
import { menuData as initialMenuData } from '@/data/menu';

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  children: MenuItem[];
};

const addIds = (items: any[]): MenuItem[] =>
  items.map((item, index) => ({
    ...item,
    id: item.id || `${Date.now()}-${index}`,
    children: item.children ? addIds(item.children) : [],
  }));

const removeItemFromTree = (id: string, items: MenuItem[]): MenuItem[] => {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: item.children ? removeItemFromTree(id, item.children) : [],
    }));
};

const addItemToTree = (
  parentId: string,
  itemToAdd: MenuItem,
  items: MenuItem[]
): MenuItem[] => {
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, itemToAdd] };
    }
    return {
      ...item,
      children: item.children
        ? addItemToTree(parentId, itemToAdd, item.children)
        : [],
    };
  });
};

const handleDragEnd = (
  result: DropResult,
  menuItems: MenuItem[],
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>
) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;

  const newItems = JSON.parse(JSON.stringify(menuItems));

  const findSourceParent = (id: string, items: MenuItem[]): MenuItem[] | null => {
      if (items.some(item => item.id === id)) return items;
      for (const item of items) {
          if (item.children) {
              const found = findSourceParent(id, item.children);
              if (found) return found;
          }
      }
      return null;
  };

  const sourceParent = findSourceParent(draggableId, newItems);
  if (!sourceParent) return;
  const sourceIndex = sourceParent.findIndex(item => item.id === draggableId);
  const [removedItem] = sourceParent.splice(sourceIndex, 1);

  const findDestinationParent = (droppableId: string, items: MenuItem[]): MenuItem[] | null => {
      if (droppableId === 'main-menu') return items;
      for (const item of items) {
          if (item.id === droppableId) return item.children;
          if (item.children) {
              const found = findDestinationParent(droppableId, item.children);
              if (found) return found;
          }
      }
      return null;
  };

  const destParent = findDestinationParent(destination.droppableId, newItems);
  if (!destParent) return;

  destParent.splice(destination.index, 0, removedItem);
  setMenuItems(newItems);
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', href: '' });
  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const menuDoc = await getDocument<{data: MenuItem[]}>('site-data', 'menu');
      if (menuDoc && menuDoc.data && menuDoc.data.length > 0) {
        setMenuItems(addIds(menuDoc.data));
      } else {
        // If no menu in DB, or it's empty, show the initial data but DO NOT save it automatically.
        // The user can save it manually if they want to start from scratch.
        setMenuItems(addIds(initialMenuData));
      }
    } catch (error) {
      console.error("Failed to fetch menu from Firestore, using initial data as fallback.", error);
      // Fallback to initial data without saving to avoid overwriting
      setMenuItems(addIds(initialMenuData));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Recursively removes the temporary 'id' field before saving to Firestore.
      const cleanDataForFirestore = (items: MenuItem[]): Omit<MenuItem, 'id'>[] => {
        return items.map(({ id, ...rest }) => ({
          ...rest,
          children: rest.children ? cleanDataForFirestore(rest.children) : [],
        }));
      };
      const cleanedMenuItems = cleanDataForFirestore(menuItems);
      await updateDocument('site-data', 'menu', { data: cleanedMenuItems });
      alert('Menu saved successfully!');
    } catch (error) {
      console.error("Failed to save menu:", error);
      alert('Failed to save menu.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    handleDragEnd(result, menuItems, setMenuItems);
  };
  
  const handleRemoveItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item and all its sub-items?')) {
        setMenuItems((prev) => removeItemFromTree(id, prev));
    }
  };
  
  const openAddItemDialog = (parentId: string | null = null) => {
    setActiveParentId(parentId);
    setNewItem({ label: '', href: '' });
    setIsDialogOpen(true);
  };

  const handleAddItem = () => {
    if (newItem.label && newItem.href) {
      const newItemWithId: MenuItem = {
        ...newItem,
        id: `${Date.now()}`,
        children: [],
      };
      if (activeParentId) {
        setMenuItems((prev) => addItemToTree(activeParentId, newItemWithId, prev));
      } else {
        setMenuItems([...menuItems, newItemWithId]);
      }
      setIsDialogOpen(false);
    } else {
        alert('Please fill out both Label and Href fields.');
    }
  };
  
  const renderMenuItem = (item: MenuItem, index: number, level = 0) => (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cn(
              `p-3 mb-2 rounded-lg border bg-card flex items-center justify-between`,
              snapshot.isDragging ? 'bg-indigo-100 dark:bg-indigo-900 shadow-lg' : ''
            )}
            style={{ marginLeft: `${level * 20}px`, ...provided.draggableProps.style }}
          >
            <div className="flex items-center">
              <div {...provided.dragHandleProps} className="cursor-grab mr-3 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                  <GripVertical />
              </div>
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-gray-500">{item.href}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => openAddItemDialog(item.id)}>
                    <PlusCircle className="h-4 w-4 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </div>
          </div>
          <Droppable droppableId={item.id} type="MENU_ITEM">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'rounded-lg min-h-[10px]',
                  snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900/50' : ''
                )}
                style={{ marginLeft: `${(level + 1) * 20}px`}}
              >
                {item.children.map((child, childIndex) => renderMenuItem(child, childIndex, level + 1))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Menu</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Menu</CardTitle>
        <Button onClick={() => openAddItemDialog(null)}>
            <Plus className="mr-2 h-4 w-4" /> Add Top-Level Item
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
            Drag and drop to reorder or nest menu items. Click save when you're done.
        </p>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="main-menu" type="MENU_ITEM">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                 className={cn(
                  'p-2 rounded-lg min-h-[20px]',
                  snapshot.isDraggingOver ? 'bg-green-100 dark:bg-green-900/50' : ''
                )}
              >
                {menuItems.map((item, index) => renderMenuItem(item, index, 0))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{activeParentId ? 'Add Sub-Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="e.g., Home"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="href">Href</Label>
                <Input
                  id="href"
                  value={newItem.href}
                  onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                  placeholder="e.g., / or /about"
                />
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </Card>
  );
}
