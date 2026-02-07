export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
}
export interface Subject {
  name: string;
}
export interface Group {
  id: number;
}
export interface Student {
  id: number;
  name: string;
  group_id: number;
  major: string;
  course_year: number;
  gender: string;
  birth_date: string;
}

export interface CreateStudentDto {
  name: string;
  group_id: number;
  major: string;
  course_year: number;
  gender: string;
  birth_date: string;
}

export interface UpdateStudentDto {
  name?: string;
  group_id?: number;
  major?: string;
  course_year?: number;
  gender?: string;
  birth_date?: string;
}
export interface Schedule {
  id: number;
  group_id: number;
  subject: string;
  start_time: string;
  end_time: string;
}

export interface CreateScheduleDto {
  group_id: number;
  subject: string;
  start_time: string;
  end_time: string;
}
export interface Attendance {
  id: number;
  subject_name: string;
  visit_day: string;
  visited: boolean;
  student_id: number;
  student_firstname?: string; 
  student_surname?: string;
}

export interface CreateAttendanceDto {
  subject_name: string;
  student_id: number;
  visit_day: string;
  visited: boolean;
}
export interface Assignment {
  id: number;
  name: string;
  subject_name: string;
  weight: number;
  date: string;
}

export interface CreateAssignmentDto {
  name: string;
  subject_name: string;
  weight: number;
  date: string;
}
export interface Grade {
  id: number;
  student_id: number;
  assignment_id: number;
  mark: number;
}

export interface CreateGradeDto {
  student_id: number;
  assignment_id: number;
  mark: number;
}
export interface StudentGPA {
  student_id: number;
  gpa: number;
}