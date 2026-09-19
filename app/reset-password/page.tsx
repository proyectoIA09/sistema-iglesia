import { cookies } from "next/headers";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function ResetPasswordPage() {
  cookies();

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      <AnimatedBackground variant="dark" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/45 to-brand-700/55" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-2xl font-semibold text-white">Nueva contraseña</h1>
          <p className="text-brand-200 text-sm mt-1">Define tu nueva contraseña de acceso</p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
