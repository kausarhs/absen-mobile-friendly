import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Attendance } from '../types/database';
import { Search } from 'lucide-react';

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
  presentPercentage: number;
}

export default function AttendanceReport() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchStudents();
    fetchAttendances();
  }, [startDate, endDate]);

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
    const classes = [...new Set(data.map(student => student.class))];
    setUniqueClasses(classes.sort());
  };

  const fetchAttendances = async () => {
    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) {
      console.error('Error fetching attendances:', error);
      return;
    }
    setAttendances(data);
  };

  const getStudentStats = (studentId: string): AttendanceStats => {
    const studentAttendances = attendances.filter(a => a.student_id === studentId);
    const stats = {
      present: studentAttendances.filter(a => a.status === 'present').length,
      absent: studentAttendances.filter(a => a.status === 'absent').length,
      late: studentAttendances.filter(a => a.status === 'late').length,
      total: studentAttendances.length,
      presentPercentage: 0
    };
    
    stats.presentPercentage = stats.total > 0 
      ? ((stats.present + stats.late) / stats.total) * 100 
      : 0;

    return stats;
  };

  const filteredStudents = students.filter(
    (student) =>
      (selectedClass ? student.class === selectedClass : true) &&
      (searchTerm
        ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">Attendance Report</h1>
            
            <div className="flex flex-col space-y-4 mb-6">
              <div className="relative w-full">
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

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
                />
              </div>
            </div>

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
                          Present
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Absent
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Late
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredStudents.map((student) => {
                        const stats = getStudentStats(student.id);
                        return (
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
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                                {stats.present}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
                                {stats.absent}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                                {stats.late}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${stats.presentPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-900 dark:text-white text-xs sm:text-sm">
                                  {stats.presentPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}