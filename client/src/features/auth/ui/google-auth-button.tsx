import { useSignInWithGoogle } from "../hooks/use-sign-in-with-google";
import { GoogleIcon } from "./google-icon";
import { Button } from "@/shared/ui/button/button";

export function GoogleAuthButton() {
  const signInWithGoogle = useSignInWithGoogle();

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      loading={signInWithGoogle.isPending}
      leftIcon={<GoogleIcon className="size-4" />}
      onClick={() => signInWithGoogle.mutate()}
    >
      Continue with Google
    </Button>
  );
}
