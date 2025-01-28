/*
  # Insert Dummy Student Data

  1. Data Insertion
    - Add 15 sample students with realistic data
    - Classes are divided into: X IPA 1, X IPA 2, X IPS 1
*/

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the first user's ID (assuming there's at least one user)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- Insert dummy students
  INSERT INTO students (student_id, name, class, user_id) VALUES
    ('2024001', 'Ahmad Rizki', 'X IPA 1', v_user_id),
    ('2024002', 'Siti Nurhaliza', 'X IPA 1', v_user_id),
    ('2024003', 'Budi Santoso', 'X IPA 1', v_user_id),
    ('2024004', 'Dewi Kartika', 'X IPA 1', v_user_id),
    ('2024005', 'Eko Prasetyo', 'X IPA 1', v_user_id),
    ('2024006', 'Fitri Handayani', 'X IPA 2', v_user_id),
    ('2024007', 'Gunawan Wibowo', 'X IPA 2', v_user_id),
    ('2024008', 'Hana Safira', 'X IPA 2', v_user_id),
    ('2024009', 'Irfan Hakim', 'X IPA 2', v_user_id),
    ('2024010', 'Jihan Aulia', 'X IPA 2', v_user_id),
    ('2024011', 'Kevin Wijaya', 'X IPS 1', v_user_id),
    ('2024012', 'Linda Permata', 'X IPS 1', v_user_id),
    ('2024013', 'Muhammad Fadli', 'X IPS 1', v_user_id),
    ('2024014', 'Nadia Putri', 'X IPS 1', v_user_id),
    ('2024015', 'Oscar Pratama', 'X IPS 1', v_user_id)
  ON CONFLICT (student_id) DO NOTHING;
END $$;