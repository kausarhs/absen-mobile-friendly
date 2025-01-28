export interface Student {
  id: string;
  student_id: string;
  name: string;
  class: string;
  created_at: string;
  user_id: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  created_at: string;
  created_by: string;
}