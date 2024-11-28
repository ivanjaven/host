// hooks/useAuth.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthProtection(allowedRoles?: string[]) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/log-in");
      } else if (allowedRoles && !allowedRoles.includes(userRole || "")) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, allowedRoles, userRole]);

  return { user, loading, userRole };
}
