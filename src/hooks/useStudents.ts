import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  studentsApi, 
  type CreateStudentDto, 
  type UpdateStudentDto 
} from "@/api";

export function useStudents() {
  const queryClient = useQueryClient();
  const { 
    data: students = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getAll(),
  });
  const createMutation = useMutation({
    mutationFn: (data: CreateStudentDto) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentDto }) => 
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
  const createStudent = async (data: CreateStudentDto) => {
    return await createMutation.mutateAsync(data);
  };

  const updateStudent = async (id: number, data: UpdateStudentDto) => {
    return await updateMutation.mutateAsync({ id, data });
  };

  const deleteStudent = async (id: number) => {
    return await deleteMutation.mutateAsync(id);
  };

  return {
    students,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}