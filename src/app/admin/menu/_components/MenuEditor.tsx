
'use client';

import React, { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { MenuItem } from '../page';


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

  const handleAddItem = (parentId: string | null = null) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: 'New Item',
      href: '/',
      children: parentId ? undefined : [], // Sub-items cannot have their own children in this simplified version
    };
    if (parentId) {
      const newItems = items.map(p => {
        if (p.id === parentId) {
          const children = p.children ? [...p.children, {...newItem, children: undefined}] : [{...newItem, children: undefined}];
          return { ...p, children };
        }
        return p;
      });
      setItems(newItems);
      // Ensure parent is open
      if (!openItems[parentId]) {
        setOpenItems(prev => ({...prev, [parentId]: true}));
      }
    } else {
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (id: string, parentId: string | null = null) => {
    if (parentId) {
       const newItems = items.map(p => {
        if (p.id === parentId) {
          const children = p.children?.filter(child => child.id !== id);
          return { ...p, children };
        }
        return p;
      });
      setItems(newItems);
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
    let newItems;
    if (parentId) {
      newItems = items.map(p => {
        if (p.id === parentId) {
            const children = p.children?.map(child => {
                if (child.id === id) {
                    return {...child, [field]: value};
                }
                return child;
            });
            return {...p, children};
        }
        return p;
      });
    } else {
      newItems = items.map(item => {
        if(item.id === id) {
            return {...item, [field]: value};
        }
        return item;
      })
    }
    setItems(newItems);
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

  const renderItem = (item: MenuItem, parentId: string | null = null) => (
      <div key={item.id} className="mb-2 rounded-lg bg-background">
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            
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
              placeholder="Label"
            />
            <Input
              value={item.href}
              onChange={(e) =>
                handleUpdateItem(item.id, 'href', e.target.value, parentId)
              }
              className="flex-1"
              placeholder="URL (e.g., /about)"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveItem(item.id, parentId)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          {item.children && openItems[item.id] && (
            <div className="pl-8 pt-2 space-y-2">
                {item.children.map((child) => renderItem(child, item.id))}
                <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddItem(item.id)}>
                    <Plus size={16} className="mr-2" /> Add Sub-Item
                </Button>
            </div>
          )}
        </div>
  );

  return (
    <Card>
        <CardContent className="p-6">
            <div className="p-4 rounded-lg border-2 border-dashed bg-transparent space-y-2">
                {items.map((item) => renderItem(item))}
            </div>
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
  );
};

export default MenuEditor;
