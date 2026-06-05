export function getGradeInfo(marks) {
  if (marks >= 80) return { grade: 'A+', point: 4.00, remarks: 'Outstanding' };
  if (marks >= 75) return { grade: 'A', point: 3.75, remarks: 'Excellent' };
  if (marks >= 70) return { grade: 'A-', point: 3.50, remarks: 'Very Good' };
  if (marks >= 65) return { grade: 'B+', point: 3.25, remarks: 'Good' };
  if (marks >= 60) return { grade: 'B', point: 3.00, remarks: 'Satisfactory' };
  if (marks >= 55) return { grade: 'B-', point: 2.75, remarks: 'Above Average' };
  if (marks >= 50) return { grade: 'C+', point: 2.50, remarks: 'Average' };
  if (marks >= 45) return { grade: 'C', point: 2.25, remarks: 'Below Average' };
  if (marks >= 40) return { grade: 'D', point: 2.00, remarks: 'Pass' };
  return { grade: 'F', point: 0.00, remarks: 'Fail' };
}

export function getSubjectTotalMarks(subject) {
  // Check for override - support both old and new format
  const isOverridden = subject.override || subject.overrideEnabled;
  if (isOverridden) {
    // New format uses overrideBy to determine if marks or GPA override
    if (subject.overrideBy === 'marks' && subject.overrideMarks !== '' && subject.overrideMarks !== undefined) {
      return parseFloat(subject.overrideMarks) || 0;
    }
    // Old format uses totalMarks
    if (subject.totalMarks) {
      return parseFloat(subject.totalMarks) || 0;
    }
    // New format GPA override - convert to marks equivalent
    if (subject.overrideBy === 'gpa' && subject.overrideGPA !== '' && subject.overrideGPA !== undefined) {
      const gpa = parseFloat(subject.overrideGPA) || 0;
      return (gpa / 4) * 100;
    }
    // Old format directGradePoint override - convert to marks equivalent
    if (subject.directGradePoint !== undefined && subject.directGradePoint !== null && subject.directGradePoint !== '') {
      const gpa = parseFloat(subject.directGradePoint) || 0;
      return (gpa / 4) * 100;
    }
  }

  let total = 0;
  
  // Determine course type - support both old (type) and new (courseType) format
  const courseType = subject.courseType || subject.type;
  
  if (courseType === 'theory') {
    // Theory Calculation - support both new flat format and old nested format
    let quizMarks = 0;
    
    // New format: check for manual quiz average first
    if (subject.theoryQuizManualAvg !== undefined && subject.theoryQuizManualAvg !== null && subject.theoryQuizManualAvg !== '') {
      quizMarks = parseFloat(subject.theoryQuizManualAvg) || 0;
    } else if (subject.theory?.quizManualAvg !== undefined && subject.theory.quizManualAvg !== null && subject.theory.quizManualAvg !== '') {
      // Old nested format
      quizMarks = parseFloat(subject.theory.quizManualAvg) || 0;
    } else {
      // Try new flat format first, then fall back to old nested format
      const q1 = parseFloat(subject.quiz1 ?? subject.theory?.quiz1) || 0;
      const q2 = parseFloat(subject.quiz2 ?? subject.theory?.quiz2) || 0;
      const q3 = parseFloat(subject.quiz3 ?? subject.theory?.quiz3) || 0;
      quizMarks = (q1 + q2 + q3) / 3;
    }

    // Midterm - support both formats
    const midterm = parseFloat(subject.midTerm ?? subject.theory?.midterm) || 0;
    // Final - support both formats
    const final = parseFloat(subject.finalExam ?? subject.theory?.final) || 0;
    // Assignment - support both formats
    const assignment = parseFloat(subject.assignment ?? subject.theory?.assignment) || 0;
    // Presentation - support both formats
    const presentation = parseFloat(subject.presentation ?? subject.theory?.presentation) || 0;
    
    let attendance = 0;
    if (subject.theory?.attendancePercent) {
      attendance = ((parseFloat(subject.theory.attendancePercent) || 0) / 100) * 7;
    } else {
      // New flat format
      attendance = parseFloat(subject.attendance ?? subject.theory?.attendance) || 0;
    }

    total = quizMarks + midterm + final + assignment + presentation + attendance;
  } else if (courseType === 'lab') {
    // Lab Calculation - support both new flat format and old nested format
    total = (parseFloat(subject.labAttendance ?? subject.lab?.attendance) || 0) +
            (parseFloat(subject.performance ?? subject.lab?.performance) || 0) +
            (parseFloat(subject.viva ?? subject.lab?.viva) || 0) +
            (parseFloat(subject.project ?? subject.lab?.project) || 0) +
            (parseFloat(subject.labFinal ?? subject.lab?.final) || 0);
  }

  return Math.min(100, Math.max(0, total));
}

export function calculateSGPA(subjects) {
  if (!subjects || subjects.length === 0) return 0;
  
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  subjects.forEach(subject => {
    let point = 0;
    
    if (subject.override && subject.directGradePoint !== null && subject.directGradePoint !== undefined && subject.directGradePoint !== '') {
      point = parseFloat(subject.directGradePoint);
    } else {
      const totalMarks = getSubjectTotalMarks(subject);
      point = getGradeInfo(totalMarks).point;
    }
    
    totalCredits += subject.credit;
    totalGradePoints += (subject.credit * point);
  });
  
  if (totalCredits === 0) return 0;
  return totalGradePoints / totalCredits;
}

export function calculateCGPA(semesters) {
  if (!semesters || semesters.length === 0) return 0;
  
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  semesters.forEach(semester => {
    if (!semester.subjects || semester.subjects.length === 0) return;
    
    const sgpa = calculateSGPA(semester.subjects);
    const credits = semester.subjects.reduce((sum, s) => sum + s.credit, 0);
    
    totalCredits += credits;
    totalGradePoints += (credits * sgpa);
  });
  
  if (totalCredits === 0) return 0;
  return totalGradePoints / totalCredits;
}
