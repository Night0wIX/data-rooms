import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { SignUpForm } from "@/features/auth/ui/sign-up-form";
import { AuthDivider } from "@/features/auth/ui/auth-divider";
import { GoogleAuthButton } from "@/features/auth/ui/google-auth-button";
import { AuthHeader } from "@/features/auth/ui/auth-header";

export function SignUp() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <AuthHeader
        icon={UserPlus}
        title="Create an account"
        subtitle="Start securing your documents"
      />

      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <GoogleAuthButton />
        <AuthDivider />
        <SignUpForm />
      </div>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to={ROUTES.login}
          className="font-semibold text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
