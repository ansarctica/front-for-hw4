import { apiClient } from "./client";
import type { Subject } from "./types";

export const subjectsApi = {
  getAll: async () => {
    const response = await apiClient.get<Subject[]>("/subjects");
    return response;
  },
};