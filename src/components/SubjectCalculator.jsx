'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  BookOpen,
  FlaskConical,
  Trash2,
  AlertCircle,
  Calculator,
  Trophy,
  FileText,
  Presentation,
  CheckCircle2,
} from 'lucide-react';

// Grade conversion helper
export function getGradeInfo(marks) {
  if (marks >= 80) return { grade: 'A+', point: 4.0, minMarks: 80, maxMarks: 100 };
  if (marks >= 75) return { grade: 'A', point: 3.75, minMarks: 75, maxMarks: 79 };
  if (marks >= 70) return { grade: 'A-', point: 3.5, minMarks: 70, maxMarks: 74 };
  if (marks >= 65) return { grade: 'B+', point: 3.25, minMarks: 65, maxMarks: 69 };
  if (marks >= 60) return { grade: 'B', point: 3.0, minMarks: 60, maxMarks: 64 };
  if (marks >= 55) return { grade: 'B-', point: 2.75, minMarks: 55, maxMarks: 59 };
  if (marks >= 50) return { grade: 'C+', point: 2.5, minMarks: 50, maxMarks: 54 };
  if (marks >= 45) return { grade: 'C', point: 2.25, minMarks: 45, maxMarks: 49 };
  if (marks >= 40) return { grade: 'D', point: 2.0, minMarks: 40, maxMarks: 44 };
  return { grade: 'F', point: 0.0, minMarks: 0, maxMarks: 39 };
}

function getGradeColor(grade) {
  if (grade === 'A+' || grade === 'A') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (grade === 'A-' || grade === 'B+') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  if (grade === 'B' || grade === 'B-') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  if (grade === 'C+' || grade === 'C') return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  if (grade === 'D') return 'bg-red-500/10 text-red-500 border-red-500/20';
  return 'bg-destructive/10 text-destructive border-destructive/20';
}

export function SubjectCalculator({ subject, onUpdate, onRemove }) {
  const [overrideOpen, setOverrideOpen] = useState(false);

  // Calculate quiz average (Theory only)
  const quizAverage = useMemo(() => {
    if (subject.courseType === 'lab') return 0;
    const q1 = typeof subject.quiz1 === 'number' ? subject.quiz1 : 0;
    const q2 = typeof subject.quiz2 === 'number' ? subject.quiz2 : 0;
    const q3 = typeof subject.quiz3 === 'number' ? subject.quiz3 : 0;
    const filled = [subject.quiz1, subject.quiz2, subject.quiz3].filter(v => v !== '').length;
    if (filled === 0) return 0;
    return Math.min(((q1 + q2 + q3) / 3), 15);
  }, [subject.quiz1, subject.quiz2, subject.quiz3, subject.courseType]);

  // Calculate total marks
  const totalMarks = useMemo(() => {
    if (subject.overrideEnabled && subject.overrideBy === 'marks' && subject.overrideMarks !== '') {
      return typeof subject.overrideMarks === 'number' ? subject.overrideMarks : 0;
    }

    if (subject.overrideEnabled && subject.overrideBy === 'gpa' && subject.overrideGPA !== '') {
      const gpa = typeof subject.overrideGPA === 'number' ? subject.overrideGPA : 0;
      return (gpa / 4) * 100;
    }

    if (subject.courseType === 'lab') {
      // Lab calculation: Attendance (10) + Performance (25) + Viva (10) + Project (25) + Final (30) = 100
      const attend = typeof subject.labAttendance === 'number' ? subject.labAttendance : 0;
      const perf = typeof subject.performance === 'number' ? subject.performance : 0;
      const viva = typeof subject.viva === 'number' ? subject.viva : 0;
      const proj = typeof subject.project === 'number' ? subject.project : 0;
      const final = typeof subject.labFinal === 'number' ? subject.labFinal : 0;
      return Math.min(attend + perf + viva + proj + final, 100);
    }

    // Theory calculation: Quiz Avg (15) + Mid Term (25) + Final (45) + Presentation (8) + Assignment (5) + Attendance (7) = 100
    const qAvg = typeof subject.quiz1 === 'number' || typeof subject.quiz2 === 'number' || typeof subject.quiz3 === 'number'
      ? quizAverage : 0;
    const mid = typeof subject.midTerm === 'number' ? subject.midTerm : 0;
    const final = typeof subject.finalExam === 'number' ? subject.finalExam : 0;
    const pres = typeof subject.presentation === 'number' ? subject.presentation : 0;
    const assign = typeof subject.assignment === 'number' ? subject.assignment : 0;
    const attend = typeof subject.attendance === 'number' ? subject.attendance : 0;

    return Math.min(qAvg + mid + final + pres + assign + attend, 100);
  }, [subject, quizAverage]);

  // Get grade info
  const gradeInfo = useMemo(() => {
    if (subject.overrideEnabled && subject.overrideBy === 'gpa' && subject.overrideGPA !== '') {
      const gpa = typeof subject.overrideGPA === 'number' ? subject.overrideGPA : 0;
      const grades = [
        { grade: 'A+', point: 4.0, minMarks: 80, maxMarks: 100 },
        { grade: 'A', point: 3.75, minMarks: 75, maxMarks: 79 },
        { grade: 'A-', point: 3.5, minMarks: 70, maxMarks: 74 },
        { grade: 'B+', point: 3.25, minMarks: 65, maxMarks: 69 },
        { grade: 'B', point: 3.0, minMarks: 60, maxMarks: 64 },
        { grade: 'B-', point: 2.75, minMarks: 55, maxMarks: 59 },
        { grade: 'C+', point: 2.5, minMarks: 50, maxMarks: 54 },
        { grade: 'C', point: 2.25, minMarks: 45, maxMarks: 49 },
        { grade: 'D', point: 2.0, minMarks: 40, maxMarks: 44 },
        { grade: 'F', point: 0.0, minMarks: 0, maxMarks: 39 },
      ];
      const matched = grades.find(g => g.point === gpa) || grades[grades.length - 1];
      return matched;
    }
    return getGradeInfo(totalMarks);
  }, [subject.overrideEnabled, subject.overrideBy, subject.overrideGPA, totalMarks]);

  // Quality points
  const qualityPoints = useMemo(() => {
    return subject.credit * gradeInfo.point;
  }, [subject.credit, gradeInfo.point]);

  // Handlers with validation
  const handleQuizChange = useCallback((field, value) => {
    const num = value === '' ? '' : Math.min(Math.max(0, parseFloat(value) || 0), 15);
    onUpdate({ [field]: num });
  }, [onUpdate]);

  const handleMarkChange = useCallback((field, value, max) => {
    const num = value === '' ? '' : Math.min(Math.max(0, parseFloat(value) || 0), max);
    onUpdate({ [field]: num });
  }, [onUpdate]);

  const handleCourseTypeChange = useCallback((value) => {
    const defaultCredit = value === 'theory' ? 3 : 1.5;
    onUpdate({ courseType: value, credit: defaultCredit });
  }, [onUpdate]);

  const handleOverrideMarksChange = useCallback((value) => {
    const num = value === '' ? '' : Math.min(Math.max(0, parseFloat(value) || 0), 100);
    onUpdate({ overrideMarks: num, overrideGPA: '' });
  }, [onUpdate]);

  const handleOverrideGPAChange = useCallback((value) => {
    const num = value === '' ? '' : Math.min(Math.max(0, parseFloat(value) || 0), 4);
    onUpdate({ overrideGPA: num, overrideMarks: '' });
  }, [onUpdate]);

  const hasQuizValues = subject.courseType === 'theory' && (subject.quiz1 !== '' || subject.quiz2 !== '' || subject.quiz3 !== '');

  return (
    <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
      {/* Result Summary Card - Top */}
      <CardHeader className="pb-3 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                {subject.courseType === 'theory' ? (
                  <BookOpen className="h-5 w-5 text-primary" />
                ) : (
                  <FlaskConical className="h-5 w-5 text-primary" />
                )}
              </div>
              <Input
                value={subject.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="text-xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
                placeholder="Subject Name"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {subject.courseType === 'theory' ? 'Theory' : 'Lab'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {subject.credit} Credits
              </Badge>
              {subject.overrideEnabled && (
                <Badge variant="destructive" className="text-xs">
                  Manual Override
                </Badge>
              )}
            </div>
          </div>

          {/* Grade Display - Beautiful Format */}
          <div className={`px-3 py-2 rounded-lg border-2 ${getGradeColor(gradeInfo.grade)}`}>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-xs opacity-70">Grade</p>
                <p className="text-xl font-bold">{gradeInfo.grade}</p>
              </div>
              <div className="w-px h-8 bg-current opacity-30"></div>
              <div className="text-center">
                <p className="text-xs opacity-70">GPA</p>
                <p className="text-lg font-bold">{gradeInfo.point.toFixed(2)}</p>
              </div>
              <div className="w-px h-8 bg-current opacity-30"></div>
              <div className="text-center">
                <p className="text-xs opacity-70">Mark</p>
                <p className="text-lg font-bold">{totalMarks.toFixed(0)}/100</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Course Type & Credit Row with Manual Override Toggle */}
        <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">Type:</Label>
            <Select value={subject.courseType} onValueChange={handleCourseTypeChange}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theory">Theory</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-6 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">Credits:</Label>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              max="6"
              value={subject.credit}
              onChange={(e) => onUpdate({ credit: parseFloat(e.target.value) || 0 })}
              className="w-20 h-8 text-center font-semibold"
            />
          </div>
          <div className="h-6 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">Manual Override:</Label>
            <Switch
              checked={subject.overrideEnabled}
              onCheckedChange={(checked) => onUpdate({ overrideEnabled: checked })}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Quality Points: <span className="font-semibold text-foreground">{qualityPoints.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Manual Override Input - Only shows when toggle is ON, hides all other inputs */}
        {subject.overrideEnabled ? (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Manual Override Active</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Total Marks (0-100):</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={subject.overrideMarks}
                  onChange={(e) => handleOverrideMarksChange(e.target.value)}
                  className="w-24 h-8"
                  placeholder="0-100"
                />
              </div>
              <span className="text-muted-foreground">or</span>
              <div className="flex items-center gap-2">
                <Label className="text-sm">GPA (0-4):</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  max="4"
                  value={subject.overrideGPA}
                  onChange={(e) => handleOverrideGPAChange(e.target.value)}
                  className="w-24 h-8"
                  placeholder="0-4"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Quiz Section - Theory Only */}
        {subject.courseType === 'theory' && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-semibold">Quizzes (Best of 3, Max 15)</h4>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Quiz 1:</Label>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  value={subject.quiz1}
                  onChange={(e) => handleQuizChange('quiz1', e.target.value)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="15"
                />
                <span className="text-[10px] text-muted-foreground">/15</span>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Quiz 2:</Label>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  value={subject.quiz2}
                  onChange={(e) => handleQuizChange('quiz2', e.target.value)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="15"
                />
                <span className="text-[10px] text-muted-foreground">/15</span>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Quiz 3:</Label>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  value={subject.quiz3}
                  onChange={(e) => handleQuizChange('quiz3', e.target.value)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="15"
                />
                <span className="text-[10px] text-muted-foreground">/15</span>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground font-medium">Avg:</Label>
                <Input
                  type="number"
                  value={hasQuizValues ? quizAverage.toFixed(2) : ''}
                  readOnly
                  className="w-20 h-8 text-center text-sm bg-muted font-semibold"
                  placeholder="0.00"
                />
                {hasQuizValues && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Exams Section - Theory Only */}
        {subject.courseType === 'theory' && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-emerald-500" />
              <h4 className="text-sm font-semibold">Examinations</h4>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Mid Term:</Label>
                <Input
                  type="number"
                  min="0"
                  max="25"
                  value={subject.midTerm}
                  onChange={(e) => handleMarkChange('midTerm', e.target.value, 25)}
                  className="w-20 h-8 text-center text-sm"
                  placeholder="25"
                />
                <span className="text-[10px] text-muted-foreground">/25</span>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Final Exam:</Label>
                <Input
                  type="number"
                  min="0"
                  max="45"
                  value={subject.finalExam}
                  onChange={(e) => handleMarkChange('finalExam', e.target.value, 45)}
                  className="w-20 h-8 text-center text-sm"
                  placeholder="45"
                />
                <span className="text-[10px] text-muted-foreground">/45</span>
              </div>
            </div>
          </div>
        )}

        {/* Continuous Assessment - Theory Only */}
        {subject.courseType === 'theory' && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Presentation className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-semibold">Continuous Assessment</h4>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Assignment:</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={subject.assignment}
                  onChange={(e) => handleMarkChange('assignment', e.target.value, 5)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="5"
                />
                <span className="text-[10px] text-muted-foreground">/5</span>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Presentation:</Label>
                <Input
                  type="number"
                  min="0"
                  max="8"
                  value={subject.presentation}
                  onChange={(e) => handleMarkChange('presentation', e.target.value, 8)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="8"
                />
                <span className="text-[10px] text-muted-foreground">/8</span>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Attendance:</Label>
                <Input
                  type="number"
                  min="0"
                  max="7"
                  value={subject.attendance}
                  onChange={(e) => handleMarkChange('attendance', e.target.value, 7)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="7"
                />
                <span className="text-[10px] text-muted-foreground">/7</span>
              </div>
            </div>
          </div>
        )}

        {/* Lab Section */}
        {subject.courseType === 'lab' && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-4 w-4 text-purple-500" />
              <h4 className="text-sm font-semibold">Lab Components (Total: 100)</h4>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Attendance:</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={subject.labAttendance}
                  onChange={(e) => handleMarkChange('labAttendance', e.target.value, 10)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="10"
                />
                <span className="text-[10px] text-muted-foreground">/10</span>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Performance:</Label>
                <Input
                  type="number"
                  min="0"
                  max="25"
                  value={subject.performance}
                  onChange={(e) => handleMarkChange('performance', e.target.value, 25)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="25"
                />
                <span className="text-[10px] text-muted-foreground">/25</span>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Viva:</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={subject.viva}
                  onChange={(e) => handleMarkChange('viva', e.target.value, 10)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="10"
                />
                <span className="text-[10px] text-muted-foreground">/10</span>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Project:</Label>
                <Input
                  type="number"
                  min="0"
                  max="25"
                  value={subject.project}
                  onChange={(e) => handleMarkChange('project', e.target.value, 25)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="25"
                />
                <span className="text-[10px] text-muted-foreground">/25</span>
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Final:</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={subject.labFinal}
                  onChange={(e) => handleMarkChange('labFinal', e.target.value, 30)}
                  className="w-16 h-8 text-center text-sm"
                  placeholder="30"
                />
                <span className="text-[10px] text-muted-foreground">/30</span>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
