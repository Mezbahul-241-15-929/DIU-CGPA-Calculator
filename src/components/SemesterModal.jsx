'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function SemesterModal({ onSave, onClose }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim() === '') return;
    onSave({
      id: Date.now().toString(),
      name: name,
      subjects: []
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-lg flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Create New Semester</h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-muted-foreground">Semester Name</label>
            <Input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Fall 2024"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3 border-t mt-4 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Create</Button>
        </div>
      </div>
    </div>
  );
}
