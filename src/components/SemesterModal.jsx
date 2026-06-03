'use client';
import { useState } from 'react';
import styles from './SemesterModal.module.css';

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
    <div className={styles.overlay}>
      <div className={`glass-card ${styles.modal}`}>
        <div className={styles.header}>
          <h2>Create New Semester</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        <div className={styles.content}>
          <div className={styles.quickEntry}>
            <div className={styles.inputGroup}>
              <label>Semester Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Fall 2024"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={`btn btn-primary`} onClick={handleSave}>Create</button>
        </div>
      </div>
    </div>
  );
}
