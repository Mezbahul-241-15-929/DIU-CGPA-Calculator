'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateCGPA, calculateSGPA } from '../lib/calculators';
import SemesterModal from '../components/SemesterModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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
    <main className="container max-w-6xl mx-auto py-10 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gradient">
          DIU CGPA Calculator
        </h1>
        <p className="text-xl text-muted-foreground">
          Manage your academic journey with ease
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-muted-foreground font-medium">Total CGPA</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold text-primary">{cgpa.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-muted-foreground font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold">{totalCredits.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-muted-foreground font-medium">Semesters</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold">{semesters.length}</div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold tracking-tight">Your Semesters</h2>
          <Button onClick={() => setIsModalOpen(true)}>
            + Add Semester
          </Button>
        </div>

        {semesters.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            <p>No semesters added yet. Click "Add Semester" to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesters.map((sem, idx) => {
              const sgpa = calculateSGPA(sem.subjects || []);
              const credits = (sem.subjects || []).reduce((s, sub) => s + sub.credit, 0);

              return (
                <Card key={sem.id || idx} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl border-b pb-4">
                      {sem.name || `Semester ${idx + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>SGPA:</span> <strong className="text-foreground">{sgpa.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Credits:</span> <strong className="text-foreground">{credits.toFixed(1)}</strong>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 flex gap-2">
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => router.push(`/semester/${sem.id || idx}`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => deleteSemester(idx)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
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
