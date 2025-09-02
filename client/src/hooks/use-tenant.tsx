import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { Tenant } from "@/types";

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  
  // Fetch actual tenant data from API
  const { data: tenantData, isLoading: tenantLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return null;
      
      const response = await fetch(`/api/tenants/${user.tenantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tenant data');
      }
      
      return response.json();
    },
    enabled: !!user?.tenantId && user.role !== 'super_admin'
  });

  // Use fetched tenant data, or fallback for super admin
  const tenant: Tenant | null = user?.role === 'super_admin' 
    ? null 
    : tenantData || null;

  return (
    <TenantContext.Provider value={{
      tenant,
      isLoading: authLoading || tenantLoading
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
