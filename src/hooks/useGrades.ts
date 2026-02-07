import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  gradesApi,
  type CreateAssignmentDto,
  type CreateGradeDto,
} from "@/api";

export function useGrades() {
  const queryClient = useQueryClient();
  const assignmentsQuery = (subjectName?: string) => {
    const result = useQuery({
      queryKey: ['assignments', subjectName],
      queryFn: () => gradesApi.getAssignments({ subject_name: subjectName }),
      enabled: !!subjectName && subjectName !== "all", 
    });
    return { ...result, data: result.data || [] };
  };
  const rankingsQuery = (filters: { group_id?: number; subject_name?: string }) => {
    const result = useQuery({
      queryKey: ['rankings', filters],
      queryFn: () => gradesApi.getRankings(filters),
      enabled: !!filters.group_id || (!!filters.subject_name && filters.subject_name !== "all"),
    });
    return { ...result, data: result.data || [] };
  };
  const createAssignment = useMutation({
    mutationFn: (data: CreateAssignmentDto) => gradesApi.createAssignment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignments', variables.subject_name] });
    },
  });
  const createGrade = useMutation({
    mutationFn: (data: CreateGradeDto) => gradesApi.createGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
  });

  return {
    assignmentsQuery,
    rankingsQuery,
    createAssignment,
    createGrade,
  };
}