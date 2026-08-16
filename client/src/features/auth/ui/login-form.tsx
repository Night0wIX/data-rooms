import { useForm } from "@tanstack/react-form";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/shared/ui/button/button";
import { FormField } from "@/shared/ui/form-field/form-field";
import { Input } from "@/shared/ui/input/input";
import { useLogin } from "../hooks/use-login";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

const DEFAULT_VALUES: LoginFormValues = { email: "", password: "" };

export function LoginForm() {
  const login = useLogin();

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      await login.mutateAsync(value);
    },
  });

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
            action={
              <button
                type="button"
                disabled
                title="Password recovery isn't available yet"
                className="cursor-not-allowed text-sm font-medium text-muted-foreground"
              >
                Forgot password?
              </button>
            }
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                type="password"
                autoComplete="current-password"
                leftIcon={<Lock />}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </FormField>
        )}
      </form.Field>

      {login.isError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {login.error.message}
        </p>
      )}

      <Button type="submit" fullWidth loading={login.isPending}>
        Log in
      </Button>
    </form>
  );
}
