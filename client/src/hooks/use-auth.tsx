import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/lib/auth-tokens";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ user: User, token: string }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ user: User, token: string }, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<{ user: User } | null, Error>({
    queryKey: ["/api/me"],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          return null;
        }
        
        const res = await apiRequest("GET", "/api/me");
        
        if (res.status === 401) {
          removeAuthToken();
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        return await res.json();
      } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Login failed");
        }
        return await res.json();
      } catch (error) {
        console.error('Login request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      setAuthToken(data.token);
      
      // Update the query cache
      queryClient.setQueryData(["/api/me"], { user: data.user });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      setAuthToken(data.token);
      
      // Update the query cache
      queryClient.setQueryData(["/api/me"], { user: data.user });
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // No need to call the server for logout with JWT
      // Just remove the token from localStorage
      removeAuthToken();
    },
    onSuccess: () => {
      // Clear the user from the query cache
      queryClient.setQueryData(["/api/me"], null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user?.user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      error: null,
      loginMutation: {} as UseMutationResult<{ user: User, token: string }, Error, LoginData>,
      logoutMutation: {} as UseMutationResult<void, Error, void>,
      registerMutation: {} as UseMutationResult<{ user: User, token: string }, Error, RegisterData>
    };
  }
  return context;
}