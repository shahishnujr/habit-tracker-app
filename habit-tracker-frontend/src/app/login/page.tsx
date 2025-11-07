import AuthForm from "@/components/AuthForm";
import { BackgroundBeams } from "@/components/BackgroundBeams";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950 text-gray-100 overflow-hidden">
      
      <BackgroundBeams className="pointer-events-none z-0" />

      <div className="z-10 pointer-events-auto">
        <AuthForm type="login" />
      </div>
    </main>
  );
}
