'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateSGPA } from '../../../lib/calculators';
import { Button } from '../../../components/ui/button';
import { SubjectCalculator, getGradeInfo } from '../../../components/SubjectCalculator';
import { Plus, Save, ArrowLeft, GraduationCap } from 'lucide-react';
import { Card } from '../../../components/ui/card';

// Create a new subject with default values
const createNewSubject = (index) => ({
  id: Date.now().toString(),
  name: `Subject ${index}`,
  courseType: 'theory',
  credit: 3,
  // Theory fields
  quiz1: '',
  quiz2: '',
  quiz3: '',
  midTerm: '',
  finalExam: '',
  presentation: '',
  assignment: '',
  attendance: '',
  // Lab fields
  labAttendance: '',
  performance: '',
  viva: '',
  project: '',
  labFinal: '',
  // Override
  overrideEnabled: false,
  overrideBy: 'marks',
  overrideMarks: '',
  overrideGPA: '',
});

// Convert old subject format to new format
const convertToNewFormat = (oldSubject) => {
  // Check if it's already in new format
  if (oldSubject.courseType !== undefined) {
    return oldSubject;
  }

  return {
    id: oldSubject.id || Date.now().toString(),
    name: oldSubject.name || `Subject`,
    courseType: oldSubject.type || 'theory',
    credit: oldSubject.credit || 3,
    quiz1: oldSubject.theory?.quiz1 || '',
    quiz2: oldSubject.theory?.quiz2 || '',
    quiz3: oldSubject.theory?.quiz3 || '',
    midTerm: oldSubject.theory?.midterm || '',
    finalExam: oldSubject.theory?.final || '',
    presentation: oldSubject.theory?.presentation || '',
    assignment: oldSubject.theory?.assignment || '',
    attendance: oldSubject.theory?.attendance || '',
    overrideEnabled: oldSubject.override || false,
    overrideBy: 'marks',
    overrideMarks: oldSubject.totalMarks || '',
    overrideGPA: oldSubject.directGradePoint || '',
  };
};

// Convert new format back to old format for SGPA calculation
const convertToOldFormat = (newSubject) => {
  const gradeInfo = getGradeInfo(0); // We'll calculate this properly
  
  return {
    id: newSubject.id,
    name: newSubject.name,
    type: newSubject.courseType,
    credit: newSubject.credit,
    override: newSubject.overrideEnabled,
    totalMarks: newSubject.overrideEnabled ? newSubject.overrideMarks : null,
    directGradePoint: newSubject.overrideEnabled ? newSubject.overrideGPA : null,
    theory: {
      quiz1: newSubject.quiz1,
      quiz2: newSubject.quiz2,
      quiz3: newSubject.quiz3,
      midterm: newSubject.midTerm,
      final: newSubject.finalExam,
      assignment: newSubject.assignment,
      presentation: newSubject.presentation,
      attendance: newSubject.attendance,
    },
    lab: oldSubject?.lab || {
      attendance: '',
      performance: '',
      viva: '',
      project: '',
      final: '',
    },
  };
};

export default function SemesterPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [semesters, setSemesters] = useLocalStorage('diu-semesters', []);
  const [semester, setSemester] = useState(null);
  const [semesterIndex, setSemesterIndex] = useState(-1);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (semesters.length > 0) {
      const idx = semesters.findIndex(s => s.id === id || s.id === parseInt(id));
      if (idx !== -1) {
        setSemester(semesters[idx]);
        setSemesterIndex(idx);
        // Convert subjects to new format
        const convertedSubjects = semesters[idx].subjects.map((sub, i) => 
          convertToNewFormat({ ...sub, index: i + 1 })
        );
        setSubjects(convertedSubjects);
      }
    }
  }, [id, semesters]);

  // Calculate SGPA from subjects
  const currentSgpa = useCallback(() => {
    let totalQualityPoints = 0;
    let totalCredits = 0;

    subjects.forEach(sub => {
      let totalMarks = 0;

      if (sub.overrideEnabled && sub.overrideBy === 'marks' && sub.overrideMarks !== '') {
        totalMarks = typeof sub.overrideMarks === 'number' ? sub.overrideMarks : 0;
      } else if (sub.overrideEnabled && sub.overrideBy === 'gpa' && sub.overrideGPA !== '') {
        const gpa = typeof sub.overrideGPA === 'number' ? sub.overrideGPA : 0;
        totalMarks = (gpa / 4) * 100;
      } else if (sub.courseType === 'lab') {
        // Lab calculation: Attendance (10) + Performance (25) + Viva (10) + Project (25) + Final (30) = 100
        const attend = typeof sub.labAttendance === 'number' ? sub.labAttendance : 0;
        const perf = typeof sub.performance === 'number' ? sub.performance : 0;
        const viva = typeof sub.viva === 'number' ? sub.viva : 0;
        const proj = typeof sub.project === 'number' ? sub.project : 0;
        const final = typeof sub.labFinal === 'number' ? sub.labFinal : 0;
        totalMarks = Math.min(attend + perf + viva + proj + final, 100);
      } else {
        // Theory calculation
        const quizAvg = (() => {
          const q1 = typeof sub.quiz1 === 'number' ? sub.quiz1 : 0;
          const q2 = typeof sub.quiz2 === 'number' ? sub.quiz2 : 0;
          const q3 = typeof sub.quiz3 === 'number' ? sub.quiz3 : 0;
          const filled = [sub.quiz1, sub.quiz2, sub.quiz3].filter(v => v !== '').length;
          if (filled === 0) return 0;
          return Math.min(((q1 + q2 + q3) / 3), 15);
        })();

        const mid = typeof sub.midTerm === 'number' ? sub.midTerm : 0;
        const final = typeof sub.finalExam === 'number' ? sub.finalExam : 0;
        const pres = typeof sub.presentation === 'number' ? sub.presentation : 0;
        const assign = typeof sub.assignment === 'number' ? sub.assignment : 0;
        const attend = typeof sub.attendance === 'number' ? sub.attendance : 0;
        totalMarks = Math.min(quizAvg + mid + final + pres + assign + attend, 100);
      }

      const gradeInfo = getGradeInfo(totalMarks);
      totalQualityPoints += sub.credit * gradeInfo.point;
      totalCredits += sub.credit;
    });

    return totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  }, [subjects]);

  const currentCredits = subjects.reduce((sum, s) => sum + s.credit, 0);

  const addSubject = () => {
    const newSubject = createNewSubject(subjects.length + 1);
    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    // Auto-save to localStorage
    const newSemesters = [...semesters];
    newSemesters[semesterIndex] = { ...semester, subjects: updatedSubjects };
    setSemesters(newSemesters);
  };

  const updateSubject = (subjectId, updates) => {
    const updatedSubjects = subjects.map(sub => 
      sub.id === subjectId ? { ...sub, ...updates } : sub
    );
    setSubjects(updatedSubjects);
    // Auto-save to localStorage
    const newSemesters = [...semesters];
    newSemesters[semesterIndex] = { ...semester, subjects: updatedSubjects };
    setSemesters(newSemesters);
  };

  const removeSubject = (subjectId) => {
    const updatedSubjects = subjects.filter(sub => sub.id !== subjectId);
    setSubjects(updatedSubjects);
    // Auto-save to localStorage
    const newSemesters = [...semesters];
    newSemesters[semesterIndex] = { ...semester, subjects: updatedSubjects };
    setSemesters(newSemesters);
  };

  const handleSave = () => {
    router.push('/');
  };

  if (!semester) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading semester data...</p>
        </div>
      </div>
    );
  }

  const sgpa = currentSgpa();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  {semester.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Card className="py-2 px-4 bg-emerald-500/10 border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">SGPA</p>
                    <p className="text-2xl font-bold text-emerald-500">{sgpa.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-px bg-emerald-500/20"></div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Credits</p>
                    <p className="text-2xl font-bold text-primary">{currentCredits.toFixed(1)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <SubjectCalculator
              key={subject.id}
              subject={subject}
              onUpdate={(updates) => updateSubject(subject.id, updates)}
              onRemove={() => removeSubject(subject.id)}
            />
          ))}
        </div>

        {/* Add Subject Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={addSubject}
            className="w-full py-6 border-dashed hover:border-solid hover:bg-primary/5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Subject
          </Button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8 pt-6 border-t">
          <Button
            onClick={handleSave}
            size="lg"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Semester & Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}