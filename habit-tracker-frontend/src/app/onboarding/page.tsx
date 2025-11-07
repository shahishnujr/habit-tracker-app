"use client";

import DashboardLayout from "@/app/layouts/DashboardLayout";
import OnboardingWizard from "@/components/OnboardingWizard";

export default function OnboardingPage() {
  // Pass backend origin from public env var (configure .env.local)
  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://127.0.0.1:8000";
  return (
    <DashboardLayout>
      <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden">
        <OnboardingWizard backendOrigin={backendOrigin} userId={1} />
      </div>
    </DashboardLayout>
  );
}
