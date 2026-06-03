'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateCGPA, calculateSGPA } from '../lib/calculators';
import SemesterModal from '../components/SemesterModal';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [semesters, setSemesters] = useLocalStorage('diu-semesters', []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cgpa = calculateCGPA(semesters);
  const totalCredits = semesters.reduce((sum, sem) => {
    if (sem.subjects) return sum + sem.subjects.reduce((s, sub) => s + sub.credit, 0);
    return sum;
  }, 0);

  const handleCreateSemester = (semesterData) => {
    setSemesters([...semesters, semesterData]);
    setIsModalOpen(false);
  };

  const deleteSemester = (index) => {
    const newSems = [...semesters];
    newSems.splice(index, 1);
    setSemesters(newSems);
  };

  return (
    <main className="main-container">
      <header className={styles.header}>
        <h1 className="text-gradient">DIU CGPA Calculator</h1>
        <p>Manage your academic journey with ease</p>
      </header>

      <section className={styles.dashboard}>
        <div className={`glass-card ${styles.statCard}`}>
          <h2>Total CGPA</h2>
          <div className={styles.cgpaValue}>{cgpa.toFixed(2)}</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <h2>Total Credits</h2>
          <div className={styles.creditValue}>{totalCredits.toFixed(1)}</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <h2>Semesters</h2>
          <div className={styles.creditValue}>{semesters.length}</div>
        </div>
      </section>

      <section className={styles.semestersSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Semesters</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Semester
          </button>
        </div>

        {semesters.length === 0 ? (
          <div className={`glass-card ${styles.emptyState}`}>
            <p>No semesters added yet. Click "Add Semester" to begin.</p>
          </div>
        ) : (
          <div className={styles.semestersGrid}>
            {semesters.map((sem, idx) => {
              const sgpa = calculateSGPA(sem.subjects || []);
              const credits = (sem.subjects || []).reduce((s, sub) => s + sub.credit, 0);

              return (
                <div key={sem.id || idx} className={`glass-card ${styles.semesterCard}`}>
                  <h3>{sem.name || `Semester ${idx + 1}`}</h3>
                  <div className={styles.semesterStats}>
                    <div><span>SGPA:</span> <strong>{sgpa.toFixed(2)}</strong></div>
                    <div><span>Credits:</span> <strong>{credits.toFixed(1)}</strong></div>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      className={styles.editBtn}
                      onClick={() => router.push(`/semester/${sem.id || idx}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => deleteSemester(idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isModalOpen && (
        <SemesterModal 
          onSave={handleCreateSemester}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}
