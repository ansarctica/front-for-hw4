import { apiClient, buildQuery } from "./client";
import type { Assignment, CreateAssignmentDto, Grade, CreateGradeDto } from "./types";

export const gradesApi = {
  getAssignments: (params: { subject_name?: string } = {}) => 
    apiClient.get<Assignment[]>(`/assignments${buildQuery(params)}`),

  createAssignment: (data: CreateAssignmentDto) =>
    apiClient.post<Assignment>("/assignments", data),

  createGrade: (data: CreateGradeDto) =>
    apiClient.post<Grade>("/grades", data),
  getRankings: (params: { group_id?: number; subject_name?: string }) =>
    apiClient.get<any[]>(`/rankings${buildQuery(params)}`),
};