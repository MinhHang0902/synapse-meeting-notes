"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, CheckCircle2, ArrowLeft } from "lucide-react";

type Screen = "signIn" | "forgotEmail" | "otp" | "newPassword" | "success";

export default function SignInPage() {
  const [screen, setScreen] = useState<Screen>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  const handleSignIn = () => {
    if (email === "example@gmail.com" && password === "123456") {
      alert("Login success");
    } else setError("Check your email address and password, then try again.");
  };

  const handleForgotSubmit = () => {
    if (!email) setError("Please enter your email.");
    else {
      setError("");
      setScreen("otp");
    }
  };

  const handleOtpSubmit = () => {
    if (otp !== "794920") setError("Invalid OTP code, please try again.");
    else {
      setError("");
      setScreen("newPassword");
    }
  };

  const handleNewPassword = () => {
    if (newPassword !== confirmPassword) setError("Passwords do not match.");
    else {
      setError("");
      setScreen("success");
    }
  };

  return (
    <div
      className="
        min-h-screen w-full
        bg-[radial-gradient(1200px_600px_at_10%_10%,#1f1f22_0%,transparent_60%),radial-gradient(900px_600px_at_90%_20%,#232326_0%,transparent_60%)]
        bg-[#0f0f12]
        flex items-center justify-center p-6
      "
    >
      {/* card middle */}
      <div
        className="
          w-full max-w-lg
          rounded-3xl border border-white/10
          bg-white/5 backdrop-blur-xl
          shadow-[0_10px_50px_-10px_rgba(0,0,0,.6)]
          px-8 py-10
          text-gray-100
        "
      >
        {(screen === "forgotEmail" || screen === "otp" || screen === "newPassword" || screen === "success") && (
          <button
            onClick={() => setScreen("signIn")}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {/* sign in */}
        {screen === "signIn" && (
          <div className="space-y-7">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/10" />
              <h1 className="text-2xl font-semibold">Welcome back with Synapse!</h1>
              <p className="text-sm text-gray-400">
                Sign in to unlock the power of intelligent transcripts
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300">Password</label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 ${error ? "border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-center text-sm text-red-400">{error}</p>}

              <Button
                onClick={handleSignIn}
                className="w-full rounded-xl bg-white text-gray-900 hover:bg-white/90"
              >
                Sign in
              </Button>

              <button
                onClick={() => {
                  setError("");
                  setScreen("forgotEmail");
                }}
                className="w-full text-center text-sm text-gray-300 hover:underline"
              >
                Forgot Password?
              </button>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                {/* <span className="text-xs text-gray-400">Forgot Password?</span>
                <div className="h-px flex-1 bg-white/10" /> */}
              </div>

              {/* <Button
                variant="outline"
                className="w-full rounded-xl border-white/15 bg-white/5 text-gray-100 hover:bg-white/10"
              >
                Single sign-on (SSO)
              </Button> */}
              <p className="text-center text-xs text-gray-500">
                You acknowledge that you read, and agree, to our{" "}
                <span className="underline">Terms of Service</span> and our{" "}
                <span className="underline">Privacy Policy</span>.
              </p>
            </div>
          </div>
        )}

        {/* forgot: email */}
        {screen === "forgotEmail" && (
          <FormLayout
            title="Forgot Password?"
            subtitle="Enter your email to reset your password."
          >
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input
                className="pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button className="mt-4 w-full rounded-xl bg-white text-gray-900 hover:bg-white/90" onClick={handleForgotSubmit}>
              Submit
            </Button>
          </FormLayout>
        )}

        {/* enter otp */}
        {screen === "otp" && (
          <FormLayout
            title="Forgot Password?"
            subtitle="Enter your 6 digits code that you received on your email."
          >
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input
                className={`pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 ${error ? "border-red-400" : ""}`}
                placeholder="794920"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <p className="mt-1 text-center text-sm font-medium text-red-300">00:{timer < 10 ? `0${timer}` : timer}</p>
            <Button className="mt-4 w-full rounded-xl bg-white text-gray-900 hover:bg-white/90" onClick={handleOtpSubmit}>
              Submit
            </Button>
            <p className="mt-3 text-center text-sm text-gray-400">
              If you didn’t receive a code! <span className="cursor-pointer text-gray-200 underline">Resend</span>
            </p>
          </FormLayout>
        )}

        {/* enter new pasword */}
        {screen === "newPassword" && (
          <FormLayout
            title="Set New Password"
            subtitle="Enter your new password to complete the reset process"
          >
            <div>
              <label className="text-sm text-gray-300">New Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300">Confirm New Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button className="mt-5 w-full rounded-xl bg-white text-gray-900 hover:bg-white/90" onClick={handleNewPassword}>
              Save New Password
            </Button>
          </FormLayout>
        )}

        {/* succesfull message*/}
        {screen === "success" && (
          <div className="mx-auto max-w-sm space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15">
              <CheckCircle2 className="text-emerald-400" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Your Password Successfully Changed</h2>
              <p className="mt-1 text-sm text-gray-400">Sign in to your account with your new password</p>
            </div>
            <Button className="w-full rounded-xl bg-white text-gray-900 hover:bg-white/90" onClick={() => setScreen("signIn")}>
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* layout form */
function FormLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
