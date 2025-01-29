import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, Search, Check, X, Clock, Menu } from 'lucide-react';
import type { Student, Attendance } from '../types/database';
import AttendanceSummary from './AttendanceSummary';

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    name: '',
    class: '',
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClass, setSelectedClass] = useState('');
  const [attendances, setAttendances] = useState<Record<string, Attendance>>({});
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchAttendances();
  }, [selectedDate]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');
    if (error) {
      console.error('Error fetching students:', error);
      return;
    }
    setStudents(data);

    const classes = [...new Set(data.map((student) => student.class))];
    setUniqueClasses(classes.sort());
  };

  const fetchAttendances = async () => {
    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .eq('date', selectedDate);
    if (error) {
      console.error('Error fetching attendances:', error);
      return;
    }
    const attendanceMap = data.reduce(
      (acc: Record<string, Attendance>, curr) => {
        acc[curr.student_id] = curr;
        return acc;
      },
      {}
    );
    setAttendances(attendanceMap);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('students').insert({
      ...newStudent,
      user_id: user.id,
    });

    if (error) {
      console.error('Error adding student:', error);
      return;
    }

    setNewStudent({ student_id: '', name: '', class: '' });
    setShowAddForm(false);
    fetchStudents();
  };

  const handleAttendance = async (
    studentId: string,
    status: 'present' | 'absent' | 'late'
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const attendance = attendances[studentId];
    if (attendance) {
      const { error } = await supabase
        .from('attendances')
        .update({ status })
        .eq('id', attendance.id);
      if (error) {
        console.error('Error updating attendance:', error);
        return;
      }
    } else {
      const { error } = await supabase.from('attendances').insert({
        student_id: studentId,
        date: selectedDate,
        status,
        created_by: user.id,
      });
      if (error) {
        console.error('Error marking attendance:', error);
        return;
      }
    }
    fetchAttendances();
  };

  const filteredStudents = students.filter(
    (student) =>
      (selectedClass ? student.class === selectedClass : true) &&
      (searchTerm
        ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.class.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                Student Attendance
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        {showMobileMenu && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg border-t dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Add Student
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center p-4 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transition-colors duration-200">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Student</h2>
              <form onSubmit={handleAddStudent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Student ID
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md py-1 border-2 border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      value={newStudent.student_id}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, student_id: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md py-1 border-2 border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Class
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md py-1 border-2 border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      value={newStudent.class}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, class: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 mb-6">
              <div className={showAddForm ? 'hidden' : 'relative w-full'}> 
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
              />
            </div>

            <AttendanceSummary
              students={students}
              attendances={attendances}
              selectedClass={selectedClass}
              selectedDate={selectedDate}
            />

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {student.student_id}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {student.name}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {student.class}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleAttendance(student.id, 'present')}
                                className={`p-1.5 rounded-full ${
                                  attendances[student.id]?.status === 'present'
                                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                    : 'hover:bg-green-100 dark:hover:bg-green-900 text-gray-400 dark:text-gray-500'
                                } transition-colors duration-200`}
                                title="Present"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAttendance(student.id, 'absent')}
                                className={`p-1.5 rounded-full ${
                                  attendances[student.id]?.status === 'absent'
                                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                    : 'hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 dark:text-gray-500'
                                } transition-colors duration-200`}
                                title="Absent"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAttendance(student.id, 'late')}
                                className={`p-1.5 rounded-full ${
                                  attendances[student.id]?.status === 'late'
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                                    : 'hover:bg-yellow-100 dark:hover:bg-yellow-900 text-gray-400 dark:text-gray-500'
                                } transition-colors duration-200`}
                                title="Late"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}