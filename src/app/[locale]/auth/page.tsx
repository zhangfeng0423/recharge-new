"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { loginAction, registerAction } from "@/actions/auth.actions";

export default function AuthPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"USER" | "MERCHANT">("USER");

  // Form states using useAction
  const loginActionState = useAction(loginAction);
  const registerActionState = useAction(registerAction);

  const [googleAuthState, setGoogleAuthState] = useState({
    error: "",
    success: false,
  });

  
  // Handle URL parameters for OAuth callbacks
  useEffect(() => {
    const error = searchParams.get("error");
    const welcome = searchParams.get("welcome");

    if (error) {
      setGoogleAuthState({
        error: decodeURIComponent(error),
        success: false,
      });
    }

    if (welcome === "true") {
      setGoogleAuthState({
        error: "",
        success: true,
      });
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  }, [searchParams, router]);

  // Handle successful authentication
  React.useEffect(() => {
    if (loginActionState?.hasSucceeded && loginActionState?.result?.data?.success) {
      router.push("/");
      router.refresh();
    }
  }, [loginActionState?.hasSucceeded, loginActionState?.result?.data?.success, router]);

  React.useEffect(() => {
    if (registerActionState?.hasSucceeded && registerActionState?.result?.data?.success) {
      router.push("/");
      router.refresh();
    }
  }, [registerActionState?.hasSucceeded, registerActionState?.result?.data?.success, router]);

  // Handle Google auth success
  useEffect(() => {
    if (googleAuthState.success) {
      // Google auth redirects are handled server-side
      // This state is just for showing success messages
    }
  }, [googleAuthState.success]);

  
  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await loginActionState.execute({ email, password });
  };

  const handleRegister = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const role = formData.get("role") as "USER" | "MERCHANT";
    const merchantName = formData.get("merchantName") as string;

    await registerActionState.execute({
      email,
      password,
      confirmPassword,
      role,
      merchantName: role === "MERCHANT" ? merchantName : undefined
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? t("auth.login") : t("auth.register")}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? t("auth.dontHaveAccount")
                : t("auth.alreadyHaveAccount")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toggle between login and register */}
            <div className="text-center mb-6">
              <Button
                variant="outline"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin ? t("auth.register") : t("auth.login")}
              </Button>
            </div>

            {/* Error/Success Messages */}
            {loginActionState?.result?.data?.message && (
              <Alert
                variant={loginActionState?.result?.data?.success ? "success" : "destructive"}
                className="mb-4"
              >
                <AlertDescription>{loginActionState.result.data.message}</AlertDescription>
              </Alert>
            )}

            {registerActionState?.result?.data?.message && (
              <Alert
                variant={registerActionState?.result?.data?.success ? "success" : "destructive"}
                className="mb-4"
              >
                <AlertDescription>{registerActionState.result.data.message}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form action={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder={t("auth.email")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder={t("auth.password")}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                >
                  {t("auth.login")}
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form action={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t("auth.email")}</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder={t("auth.email")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">
                    {t("auth.password")}
                  </Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder={t("auth.password")}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">
                    {t("auth.confirmPassword")}
                  </Label>
                  <Input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder={t("auth.confirmPassword")}
                    required
                    minLength={8}
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>{t("auth.roleLabel")}</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="role-user"
                        name="role"
                        value="USER"
                        defaultChecked={selectedRole === "USER"}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="role-user" className="text-sm">
                        {t("roles.player")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="role-merchant"
                        name="role"
                        value="MERCHANT"
                        defaultChecked={selectedRole === "MERCHANT"}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="role-merchant" className="text-sm">
                        {t("roles.merchant")}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Merchant Name (only show if MERCHANT role is selected) */}
                {selectedRole === "MERCHANT" && (
                  <div className="space-y-2">
                    <Label htmlFor="merchant-name">
                      {t("auth.merchantNameLabel")}
                    </Label>
                    <Input
                      id="merchant-name"
                      name="merchantName"
                      type="text"
                      placeholder={t("auth.merchantNamePlaceholder")}
                      required={selectedRole === "MERCHANT"}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                >
                  {t("auth.register")}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t("auth.orDivider")}
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <GoogleButton
              onSuccess={() => {
                // Google OAuth will redirect automatically, no need to show success message here
                // The redirect happens via the Supabase OAuth flow
              }}
              onError={(error) => {
                setGoogleAuthState({ error, success: false });
              }}
            />

            {/* Show Google auth messages */}
            {googleAuthState.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{googleAuthState.error}</AlertDescription>
              </Alert>
            )}

            {googleAuthState.success && (
              <Alert className="mt-4">
                <AlertDescription>
                  {t("auth.googleAuthSuccessRedirect")}
                </AlertDescription>
              </Alert>
            )}

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
                  onClick={() => {
                    // TODO: Implement forgot password flow
                  }}
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
