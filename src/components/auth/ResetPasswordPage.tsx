import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Palette, Loader2 } from "lucide-react";
import { getRouteApi, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";

const route = getRouteApi("/reset-password");

// Better Auth's default minimum password length.
const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type ResetForm = z.infer<typeof resetSchema>;

/**
 * Landing page for the emailed reset link. Neon Auth verifies the link, then redirects
 * here with `?token=…` (or `?error=INVALID_TOKEN` if it expired — links last 15 minutes).
 */
export function ResetPasswordPage() {
  const router = useRouter();
  const { token, error: linkError } = route.useSearch();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: ResetForm) => {
    setError(null);
    if (!token) return;
    // The Supabase-style adapter has no token-based reset, so call Better Auth directly.
    const { error } = await db.auth
      .getBetterAuthInstance()
      .resetPassword({ newPassword: data.password, token });
    if (error) {
      setError(error.message ?? "Could not reset password");
      return;
    }
    toast.success("Password set. Sign in with your new password.");
    await router.navigate({ to: "/login" });
  };

  const invalidLink = !token || !!linkError;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Palette className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold spark-text">Museboard</span>
            </div>
            <p className="text-sm text-muted-foreground">Set a new password</p>
          </CardHeader>
          {invalidLink ? (
            <CardContent>
              <p className="text-sm text-destructive text-center">
                This reset link is invalid or has expired. Request a new one from the
                sign-in page.
              </p>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirm")}
                  aria-invalid={!!errors.confirm}
                />
                {errors.confirm && (
                  <p className="text-sm text-destructive">{errors.confirm.message}</p>
                )}
              </div>
            </CardContent>
          )}
          <CardFooter className="flex flex-col gap-2">
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {!invalidLink && (
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Set password
              </Button>
            )}
            <Link
              to="/login"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
