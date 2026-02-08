import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { authApi, type User, type LoginDto, type RegisterDto, type AuthResponse } from "@/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<AuthResponse>;
  register: (data: RegisterDto) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const { data: user = null, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.getMe,
    enabled: !!token, 
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      localStorage.setItem("token", response.token);
      setToken(response.token);
      queryClient.setQueryData(["me"], response.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      localStorage.setItem("token", response.token);
      setToken(response.token);
      queryClient.setQueryData(["me"], response.user);
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.setQueryData(["me"], null);
    queryClient.removeQueries({ queryKey: ["me"] });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: (data) => loginMutation.mutateAsync(data),
        register: (data) => registerMutation.mutateAsync(data),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}