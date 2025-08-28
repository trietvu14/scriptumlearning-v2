import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./use-auth";
import { Tenant } from "@/types";

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  
  // In a real implementation, you would fetch tenant data based on user.tenantId
  // For now, we'll create a mock tenant based on the user data
  const tenant: Tenant | null = user ? {
    id: user.tenantId,
    name: "Johns Hopkins Medical School",
    domain: "jhu-medical.edu",
    educationalArea: "medical_school",
    isActive: true
  } : null;

  return (
    <TenantContext.Provider value={{
      tenant,
      isLoading: authLoading
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
