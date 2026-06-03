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
  if (subject.override) {
    return subject.totalMarks || 0;
  }

  let total = 0;
  
  if (subject.type === 'theory') {
    // Theory Calculation
    let quizMarks = 0;
    if (subject.theory?.quizManualAvg !== undefined && subject.theory.quizManualAvg !== null && subject.theory.quizManualAvg !== '') {
      quizMarks = parseFloat(subject.theory.quizManualAvg) || 0;
    } else {
      const q1 = parseFloat(subject.theory?.quiz1) || 0;
      const q2 = parseFloat(subject.theory?.quiz2) || 0;
      const q3 = parseFloat(subject.theory?.quiz3) || 0;
      // Usually best 2 out of 3, but let's just take average of top 2 for now, or just average of all 3 if requested.
      // The user didn't specify, so let's do best 2 out of 3 average, which is standard, or just sum of all / 3?
      // "quize1,quize2,quize3 each 15mark & automatic avg calculate". Let's average all 3.
      quizMarks = (q1 + q2 + q3) / 3;
    }

    const midterm = parseFloat(subject.theory?.midterm) || 0;
    const final = parseFloat(subject.theory?.final) || 0;
    const assignment = parseFloat(subject.theory?.assignment) || 0;
    const presentation = parseFloat(subject.theory?.presentation) || 0;
    
    let attendance = 0;
    if (subject.theory?.attendancePercent) {
      attendance = ((parseFloat(subject.theory.attendancePercent) || 0) / 100) * 7;
    } else {
      attendance = parseFloat(subject.theory?.attendance) || 0;
    }

    total = quizMarks + midterm + final + assignment + presentation + attendance;
  } else if (subject.type === 'lab') {
    // Lab Calculation
    total = (parseFloat(subject.lab?.attendance) || 0) +
            (parseFloat(subject.lab?.performance) || 0) +
            (parseFloat(subject.lab?.viva) || 0) +
            (parseFloat(subject.lab?.project) || 0) +
            (parseFloat(subject.lab?.final) || 0);
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
