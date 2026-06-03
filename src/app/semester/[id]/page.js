'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateSGPA, getSubjectTotalMarks, getGradeInfo } from '../../../lib/calculators';
import styles from './semester.module.css';

export default function SemesterPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [semesters, setSemesters] = useLocalStorage('diu-semesters', []);
  const [semester, setSemester] = useState(null);
  const [semesterIndex, setSemesterIndex] = useState(-1);

  useEffect(() => {
    if (semesters.length > 0) {
      const idx = semesters.findIndex(s => s.id === id || s.id === parseInt(id));
      if (idx !== -1) {
        setSemester(semesters[idx]);
        setSemesterIndex(idx);
      }
    }
  }, [id, semesters]);

  if (!semester) {
    return <div className="main-container">Loading...</div>;
  }

  const addSubject = () => {
    const newSubject = {
      id: Date.now().toString(),
      name: `Subject ${semester.subjects.length + 1}`,
      credit: 3,
      type: 'theory',
      override: false,
      totalMarks: null,
      directGradePoint: null,
      theory: {
        quiz1: '', quiz2: '', quiz3: '', quizManualAvg: '',
        midterm: '', final: '', assignment: '', presentation: '', attendance: '', attendancePercent: ''
      },
      lab: {
        attendance: '', performance: '', viva: '', project: '', final: ''
      }
    };

    const newSemester = { ...semester, subjects: [...semester.subjects, newSubject] };
    setSemester(newSemester);
  };

  const updateSubject = (subId, field, value) => {
    const newSubjects = semester.subjects.map(sub => {
      if (sub.id === subId) {
        return { ...sub, [field]: value };
      }
      return sub;
    });
    setSemester({ ...semester, subjects: newSubjects });
  };

  const updateTheory = (subId, field, value) => {
    const newSubjects = semester.subjects.map(sub => {
      if (sub.id === subId) {
        return { ...sub, theory: { ...sub.theory, [field]: value } };
      }
      return sub;
    });
    setSemester({ ...semester, subjects: newSubjects });
  };

  const updateLab = (subId, field, value) => {
    const newSubjects = semester.subjects.map(sub => {
      if (sub.id === subId) {
        return { ...sub, lab: { ...sub.lab, [field]: value } };
      }
      return sub;
    });
    setSemester({ ...semester, subjects: newSubjects });
  };

  const removeSubject = (subId) => {
    const newSubjects = semester.subjects.filter(s => s.id !== subId);
    setSemester({ ...semester, subjects: newSubjects });
  };

  const handleSave = () => {
    const newSemesters = [...semesters];
    newSemesters[semesterIndex] = semester;
    setSemesters(newSemesters);
    router.push('/');
  };

  const currentSgpa = calculateSGPA(semester.subjects);
  const currentCredits = semester.subjects.reduce((sum, s) => sum + s.credit, 0);

  return (
    <main className="main-container">
      <div className={styles.header}>
        <button onClick={() => router.push('/')} className="btn">&larr; Back to Dashboard</button>
        <h1>{semester.name}</h1>
        <div className={styles.statsRow}>
          <div className={`glass-card ${styles.statMini}`}>
            <span>SGPA</span>
            <strong>{currentSgpa.toFixed(2)}</strong>
          </div>
          <div className={`glass-card ${styles.statMini}`}>
            <span>Credits</span>
            <strong>{currentCredits.toFixed(1)}</strong>
          </div>
        </div>
      </div>

      <div className={styles.subjectsList}>
        {semester.subjects.map((sub, index) => {
          const totalMarks = getSubjectTotalMarks(sub);
          const gradeInfo = getGradeInfo(totalMarks);
          let displayGrade = gradeInfo.grade;
          
          if (sub.override && sub.directGradePoint) {
            displayGrade = sub.directGradePoint + " (GP)";
          }

          return (
            <div key={sub.id} className={`glass-card ${styles.subjectCard}`}>
              <div className={styles.subjectHeader}>
                <div className={styles.subjectTitleGroup}>
                  <input 
                    type="text" 
                    value={sub.name} 
                    onChange={e => updateSubject(sub.id, 'name', e.target.value)}
                    className={styles.nameInput}
                    placeholder="Subject Name"
                  />
                  <div className={styles.gradeBadge}>
                    <span>{displayGrade}</span>
                    <small>{totalMarks.toFixed(1)} Marks</small>
                  </div>
                </div>
                <button onClick={() => removeSubject(sub.id)} className={styles.removeBtn}>&times;</button>
              </div>

              <div className={styles.subjectControls}>
                <div className={styles.inputGroup}>
                  <label>Credit</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={sub.credit} 
                    onChange={e => updateSubject(sub.id, 'credit', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Type</label>
                  <select 
                    value={sub.type} 
                    onChange={e => updateSubject(sub.id, 'type', e.target.value)}
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
                <div className={styles.overrideToggle}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={sub.override} 
                      onChange={e => updateSubject(sub.id, 'override', e.target.checked)}
                    />
                    Manual Override Marks/GP
                  </label>
                </div>
              </div>

              {!sub.override ? (
                sub.type === 'theory' ? (
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailSection}>
                      <h4>Quizzes (15 marks avg)</h4>
                      <div className={styles.quizRow}>
                        <input type="number" placeholder="Q1" value={sub.theory.quiz1} onChange={e => updateTheory(sub.id, 'quiz1', e.target.value)} />
                        <input type="number" placeholder="Q2" value={sub.theory.quiz2} onChange={e => updateTheory(sub.id, 'quiz2', e.target.value)} />
                        <input type="number" placeholder="Q3" value={sub.theory.quiz3} onChange={e => updateTheory(sub.id, 'quiz3', e.target.value)} />
                        <span>OR</span>
                        <input type="number" placeholder="Avg" value={sub.theory.quizManualAvg} onChange={e => updateTheory(sub.id, 'quizManualAvg', e.target.value)} />
                      </div>
                    </div>
                    
                    <div className={styles.detailSection}>
                      <h4>Exams</h4>
                      <div className={styles.examRow}>
                        <div className={styles.inputGroup}>
                          <label>Midterm (25)</label>
                          <input type="number" value={sub.theory.midterm} onChange={e => updateTheory(sub.id, 'midterm', e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Final (40)</label>
                          <input type="number" value={sub.theory.final} onChange={e => updateTheory(sub.id, 'final', e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <h4>Continuous Assessment</h4>
                      <div className={styles.caRow}>
                        <div className={styles.inputGroup}>
                          <label>Assign. (5)</label>
                          <input type="number" value={sub.theory.assignment} onChange={e => updateTheory(sub.id, 'assignment', e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Present. (8)</label>
                          <input type="number" value={sub.theory.presentation} onChange={e => updateTheory(sub.id, 'presentation', e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Attend. (7) OR %</label>
                          <div className={styles.attendanceRow}>
                            <input type="number" placeholder="/ 7" value={sub.theory.attendance} onChange={e => updateTheory(sub.id, 'attendance', e.target.value)} />
                            <input type="number" placeholder="%" value={sub.theory.attendancePercent} onChange={e => updateTheory(sub.id, 'attendancePercent', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailSection}>
                      <h4>Lab Components (Must sum to 100 max)</h4>
                      <div className={styles.labRow}>
                        <div className={styles.inputGroup}>
                          <label>Attendance</label>
                          <input type="number" placeholder="10" value={sub.lab.attendance} onChange={e => updateLab(sub.id, 'attendance', e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Performance</label>
                          <input type="number" placeholder="25" value={sub.lab.performance} onChange={e => updateLab(sub.id, 'performance', e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Assign/Viva</label>
                          <input type="number" placeholder="10" value={sub.lab.viva} onChange={e => updateLab(sub.id, 'viva', e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Project</label>
                          <input type="number" placeholder="25" value={sub.lab.project} onChange={e => updateLab(sub.id, 'project', e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Final</label>
                          <input type="number" placeholder="30" value={sub.lab.final} onChange={e => updateLab(sub.id, 'final', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className={styles.overrideBox}>
                  <p>Override active. Enter direct marks or Grade Point below:</p>
                  <div className={styles.overrideRow}>
                    <div className={styles.inputGroup}>
                      <label>Total Marks (0-100)</label>
                      <input 
                        type="number" 
                        value={sub.totalMarks !== null ? sub.totalMarks : ''} 
                        onChange={e => {
                          updateSubject(sub.id, 'totalMarks', e.target.value ? parseFloat(e.target.value) : null);
                          updateSubject(sub.id, 'directGradePoint', null);
                        }} 
                      />
                    </div>
                    <span>OR</span>
                    <div className={styles.inputGroup}>
                      <label>Direct Grade Point (0-4.0)</label>
                      <input 
                        type="number" 
                        step="0.25"
                        value={sub.directGradePoint !== null ? sub.directGradePoint : ''} 
                        onChange={e => {
                          updateSubject(sub.id, 'directGradePoint', e.target.value ? parseFloat(e.target.value) : null);
                          updateSubject(sub.id, 'totalMarks', null);
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button className={styles.addSubjectBtn} onClick={addSubject}>+ Add Subject</button>
      </div>

      <div className={styles.pageFooter}>
        <button className="btn btn-primary" onClick={handleSave}>Save Semester</button>
      </div>
    </main>
  );
}
