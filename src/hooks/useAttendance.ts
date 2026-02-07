import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attendanceApi,
  type CreateAttendanceDto,
} from "@/api";

type AttendanceFilter = 
  | { type: 'student'; id: number } 
  | { type: 'subject'; name: string }
  | { type: 'none' };

export function useAttendance() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AttendanceFilter>({ type: 'none' });
  const { 
    data: rawAttendance,
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['attendance', filter],
    queryFn: async () => {
      if (filter.type === 'student') {
        return await attendanceApi.getAll({ student_id: filter.id });
      }
      if (filter.type === 'subject') {
        return await attendanceApi.getAll({ subject_name: filter.name });
      }
      return []; 
    },
    enabled: filter.type !== 'none',
  });
  const attendance = rawAttendance || [];
  const createMutation = useMutation({
    mutationFn: (data: CreateAttendanceDto) => attendanceApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, visited }: { id: number; visited: boolean }) => 
      attendanceApi.update(id, { visited }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attendanceApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });
  const clearAttendance = useCallback(() => setFilter({ type: 'none' }), []);
  const getByStudentId = useCallback(async (id: number) => setFilter({ type: 'student', id }), []);
  const getBySubjectName = useCallback(async (name: string) => setFilter({ type: 'subject', name }), []);

  return {
    attendance,
    isLoading,
    error: error ? (error as Error).message : null,
    clearAttendance,
    getByStudentId,
    getBySubjectName,
    createAttendance: (data: CreateAttendanceDto) => createMutation.mutateAsync(data),
    updateAttendance: (id: number, visited: boolean) => updateMutation.mutateAsync({ id, visited }),
    deleteAttendance: (id: number) => deleteMutation.mutateAsync(id),
  };
}