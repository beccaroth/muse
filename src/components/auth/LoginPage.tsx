import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Palette, Loader2 } from "lucide-react";
import { useRouter, useSearch } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/authStore";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

/**
 * The `redirect` search param is attacker-controllable via the URL, so only same-origin
 * paths are followed. '//evil.com' and 'https://evil.com' are both browser-navigable
 * targets, which would turn the login page into an open redirect.
 */
function safeRedirect(target: string | undefined): string | null {
  if (!target) return null;
  if (!target.startsWith("/") || target.startsWith("//")) return null;
  return target;
}

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const router = useRouter();
  const search = useSearch({ from: "/login" });
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setNotice(null);
    try {
      await auth.login(data.email, data.password);
      await router.invalidate();
      const redirect = safeRedirect(search.redirect);
      if (redirect) {
        router.history.push(redirect);
      } else {
        await router.navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  // Neon Auth only sets passwords through an emailed reset link, so this is also how the
  // owner sets the first password for an account created in the Neon console.
  const onForgotPassword = async () => {
    setError(null);
    setNotice(null);
    if (!(await trigger("email"))) return;
    setIsSendingReset(true);
    try {
      const { error } = await db.auth.resetPasswordForEmail(getValues("email"), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      // Same message whether or not the account exists, so the form can't be used to
      // probe for registered emails.
      setNotice("If that email has an account, a reset link is on its way.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Palette className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold spark-text">Museboard</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={isSendingReset}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            {notice && (
              <p className="text-sm text-muted-foreground text-center">{notice}</p>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
