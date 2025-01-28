import React from 'react';
import { Attendance, Student } from '../types/database';

interface AttendanceSummaryProps {
  students: Student[];
  attendances: Record<string, Attendance>;
  selectedClass: string;
  selectedDate: string;
}

export default function AttendanceSummary({ students, attendances, selectedClass, selectedDate }: AttendanceSummaryProps) {
  const filteredStudents = selectedClass 
    ? students.filter(student => student.class === selectedClass)
    : students;

  const summary = {
    total: filteredStudents.length,
    present: 0,
    absent: 0,
    late: 0,
    unmarked: 0
  };

  filteredStudents.forEach(student => {
    const attendance = attendances[student.id];
    if (!attendance) {
      summary.unmarked++;
    } else {
      summary[attendance.status as keyof typeof summary]++;
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors duration-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
        Attendance Summary - {selectedDate}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg transition-colors duration-200">
          <p className="text-sm text-green-600 dark:text-green-400">Present</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.present}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg transition-colors duration-200">
          <p className="text-sm text-red-600 dark:text-red-400">Absent</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.absent}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg transition-colors duration-200">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Late</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.late}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
          <p className="text-sm text-gray-500 dark:text-gray-400">Unmarked</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.unmarked}</p>
        </div>
      </div>
    </div>
  );
}