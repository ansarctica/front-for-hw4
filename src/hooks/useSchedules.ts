import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  schedulesApi,
  type CreateScheduleDto,
} from "@/api";

export function useSchedules() {
  const queryClient = useQueryClient();
  const [filterGroupId, setFilterGroupId] = useState<number | null>(null);
  const { 
    data: schedules = [], 
    isLoading, 
    error  } = useQuery({
    queryKey: ['schedules', filterGroupId],
    queryFn: () => {
      if (filterGroupId) {
        return schedulesApi.getAll({ group_id: filterGroupId });
      }
      return schedulesApi.getAll();
    },
  });
  const createMutation = useMutation({
    mutationFn: (data: CreateScheduleDto) => schedulesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateScheduleDto> }) => 
      schedulesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => schedulesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });
  const fetchAllSchedules = () => setFilterGroupId(null);
  
  const getByGroupId = async (groupId: number) => {
    setFilterGroupId(groupId);
    return []; 
  };

  const createSchedule = async (data: CreateScheduleDto) => createMutation.mutateAsync(data);
  const updateSchedule = async (id: number, data: Partial<CreateScheduleDto>) => updateMutation.mutateAsync({ id, data });
  const deleteSchedule = async (id: number) => deleteMutation.mutateAsync(id);

  return {
    schedules,
    isLoading,
    error: error ? (error as Error).message : null,
    fetchAllSchedules,
    getByGroupId,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}