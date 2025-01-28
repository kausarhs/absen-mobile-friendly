/*
  # Student Attendance System Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `student_id` (text, unique) - Student's school ID
      - `name` (text) - Student's full name
      - `class` (text) - Student's class/grade
      - `created_at` (timestamp)
      - `user_id` (uuid) - Reference to auth.users

    - `attendances`
      - `id` (uuid, primary key)
      - `student_id` (uuid) - Reference to students.id
      - `date` (date)
      - `status` (text) - present/absent/late
      - `notes` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid) - Reference to auth.users

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  name text NOT NULL,
  class text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Create attendances table
CREATE TABLE IF NOT EXISTS attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(student_id, date)
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Users can view all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for attendances table
CREATE POLICY "Users can view all attendances"
  ON attendances
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert attendances"
  ON attendances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own attendances"
  ON attendances
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);