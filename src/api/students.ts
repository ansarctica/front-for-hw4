import { apiClient, buildQuery } from "./client";
import type { Student, CreateStudentDto, UpdateStudentDto } from "./types";

export const studentsApi = {
  getAll: (params: { group_id?: number; major?: string; course_year?: number; limit?: number } = {}) => 
    apiClient.get<Student[]>(`/students${buildQuery(params)}`),

  getById: (id: number) => apiClient.get<Student>(`/students/${id}`),

  create: (data: CreateStudentDto) =>
    apiClient.post<Student>("/students", data),

  update: (id: number, data: UpdateStudentDto) =>
    apiClient.patch<Student>(`/students/${id}`, data),

  delete: (id: number) => apiClient.delete<void>(`/students/${id}`),
  getGPA: (id: number) => apiClient.get<{ gpa: number }>(`/students/${id}/gpa`),
};