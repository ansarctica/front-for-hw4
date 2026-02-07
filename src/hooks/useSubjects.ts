import { useQuery } from "@tanstack/react-query";
import { subjectsApi } from "@/api";

export function useSubjects() {
  const { 
    data: subjects = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    subjects,
    isLoading,
    error,
  };
}