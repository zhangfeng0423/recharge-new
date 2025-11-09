"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"USER" | "MERCHANT">("USER");

  // Form states
  const [loginState, setLoginState] = useState({
    success: false,
    message: "",
    pending: false,
  });

  const [registerState, setRegisterState] = useState({
    success: false,
    message: "",
    pending: false,
  });

  const [googleAuthState, setGoogleAuthState] = useState({
    error: "",
    success: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER" as "USER" | "MERCHANT",
    merchantName: "",
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
    if (loginState.success) {
      router.push("/");
      router.refresh();
    }
  }, [loginState.success, router]);

  React.useEffect(() => {
    if (registerState.success) {
      router.push("/");
      router.refresh();
    }
  }, [registerState.success, router]);

  // Handle Google auth success
  useEffect(() => {
    if (googleAuthState.success) {
      // Google auth redirects are handled server-side
      // This state is just for showing success messages
    }
  }, [googleAuthState.success, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role: "USER" | "MERCHANT") => {
    setSelectedRole(role);
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState((prev) => ({ ...prev, pending: true, message: "" }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setLoginState({
          success: true,
          message: result.message,
          pending: false,
        });
      } else {
        setLoginState({
          success: false,
          message: result.message || "Login failed",
          pending: false,
        });
      }
    } catch (error) {
      setLoginState({
        success: false,
        message: "An unexpected error occurred",
        pending: false,
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterState((prev) => ({ ...prev, pending: true, message: "" }));

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          merchantName: formData.merchantName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setRegisterState({
          success: true,
          message: result.message,
          pending: false,
        });
      } else {
        setRegisterState({
          success: false,
          message: result.message || "Registration failed",
          pending: false,
        });
      }
    } catch (error) {
      setRegisterState({
        success: false,
        message: "An unexpected error occurred",
        pending: false,
      });
    }
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
                disabled={loginState.pending || registerState.pending}
              >
                {isLogin ? t("auth.register") : t("auth.login")}
              </Button>
            </div>

            {/* Error/Success Messages */}
            {loginState.message && (
              <Alert
                variant={loginState.success ? "success" : "destructive"}
                className="mb-4"
              >
                <AlertDescription>{loginState.message}</AlertDescription>
              </Alert>
            )}

            {registerState.message && (
              <Alert
                variant={registerState.success ? "success" : "destructive"}
                className="mb-4"
              >
                <AlertDescription>{registerState.message}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder={t("auth.email")}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loginState.pending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder={t("auth.password")}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loginState.pending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginState.pending}
                >
                  {loginState.pending ? t("common.loading") : t("auth.login")}
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t("auth.email")}</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder={t("auth.email")}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={registerState.pending}
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
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={registerState.pending}
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
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={registerState.pending}
                    minLength={8}
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="role-user"
                        name="role"
                        value="USER"
                        checked={selectedRole === "USER"}
                        onChange={() => handleRoleChange("USER")}
                        disabled={registerState.pending}
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
                        checked={selectedRole === "MERCHANT"}
                        onChange={() => handleRoleChange("MERCHANT")}
                        disabled={registerState.pending}
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
                    <Label htmlFor="merchant-name">Merchant Name</Label>
                    <Input
                      id="merchant-name"
                      name="merchantName"
                      type="text"
                      placeholder="Enter your merchant name"
                      value={formData.merchantName}
                      onChange={handleInputChange}
                      required={selectedRole === "MERCHANT"}
                      disabled={registerState.pending}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerState.pending}
                >
                  {registerState.pending
                    ? t("common.loading")
                    : t("auth.register")}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Sign In */}
            <GoogleButton
              onSuccess={() => {
                setGoogleAuthState({ error: "", success: true });
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
                  Successfully authenticated with Google! Redirecting...
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
                    console.log("Forgot password clicked");
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
