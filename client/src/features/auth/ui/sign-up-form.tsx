import { useForm } from "@tanstack/react-form";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { signUpSchema, type SignUpFormValues } from "../schemas/sign-up.schema";
import { Button } from "@/shared/ui/button/button";
import { FormField } from "@/shared/ui/form-field/form-field";
import { Input } from "@/shared/ui/input/input";
import { useSignUp } from "../hooks/use-sign-up";

export const SIGN_UP_FORM_DEFAULT_VALUES: SignUpFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignUpForm() {
  const signUp = useSignUp();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const form = useForm({
    defaultValues: SIGN_UP_FORM_DEFAULT_VALUES,
    validators: { onChange: signUpSchema },
    onSubmit: async ({ value }) => {
      const result = await signUp.mutateAsync(value);
      if (result.requiresEmailConfirmation) setAwaitingConfirmation(true);
    },
  });

  if (awaitingConfirmation) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        We sent a confirmation link to your email. Follow it to finish creating
        your account.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <FormField
            label="Email"
            required
            error={field.state.meta.errors[0]?.message}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                leftIcon={<Mail />}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </FormField>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <FormField
            label="Password"
            required
            error={field.state.meta.errors[0]?.message}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                type="password"
                autoComplete="new-password"
                leftIcon={<Lock />}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </FormField>
        )}
      </form.Field>

      <form.Field name="confirmPassword">
        {(field) => (
          <FormField
            label="Confirm password"
            required
            error={field.state.meta.errors[0]?.message}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                type="password"
                autoComplete="new-password"
                leftIcon={<Lock />}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </FormField>
        )}
      </form.Field>

      {signUp.isError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {signUp.error.message}
        </p>
      )}

      <Button type="submit" fullWidth loading={signUp.isPending}>
        Create account
      </Button>
    </form>
  );
}
