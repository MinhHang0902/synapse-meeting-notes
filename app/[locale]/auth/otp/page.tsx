'use client';

import BackButton from "@/components/auth/BackButton";
import FormLayout from "@/components/auth/FormLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthApi } from "@/lib/api/auth";
import { setSessionItemWithExpiry } from "@/lib/utils/storage";
import { Mail } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function OtpPage() {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();

    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const fromQuery = searchParams.get("email") || "";
        const fromSession = sessionStorage.getItem("fp_email") || "";
        const finalEmail = fromQuery || fromSession;
        setEmail(finalEmail);

        if (fromQuery) sessionStorage.setItem("fp_email", fromQuery);
    }, [searchParams]);

    useEffect(() => {
        if (timer === 0) return; 
        const id = setInterval(() => setTimer((t) => t > 0 ? t - 1 : 0), 1000);
        return () => clearInterval(id);
    }, [timer]);

    const isOtpValid = useMemo(() => /^\d{6}$/.test(otp), [otp]);

    const handleOtpSubmit = async () => {
        setError("");
        if (!email) {
            setError("Missing email. Please start from Forgot Password.");
            router.replace(`/${locale}/auth/forgot-password`);
            return;
        }
        if (!isOtpValid) {
            setError("OTP code must be 6 digits.");
            return;
        }

        try {
            const data = { email, otp };
            const response = await AuthApi.verifyOtp(data);
            if (response.ok) {
                sessionStorage.removeItem("fp_email");
                setSessionItemWithExpiry("reset_password_token", response.resetToken, 300); // 5 phút
                router.push(`/${locale}/auth/new-password`);
            } else {
                setError("Failed to verify OTP. Please try again.");
            }
        } catch {
            setError("An unexpected error occurred. Please try again later.");
        }
    }

    const handleResend = async () => {
        setError("");
        if (!email) {
            setError("Missing email. Please start from Forgot Password.");
            router.replace(`/${locale}/auth/forgot-password`);
            return;
        }
        try {
            const res = await AuthApi.requestOtp({ email });
            if (res.ok) {
                setTimer(30); 
            } else {
                setError(res.message || "Failed to resend OTP.");
            }
        } catch {
            setError("An unexpected error occurred. Please try again later.");
        }
    };

    return (
        <Wrapper>
            <BackButton />
            <FormLayout title="Forgot Password?" subtitle="Enter your 6 digits code that you received on your email.">
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input
                        className={`pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 rounded-lg ${error ? 'border-red-400' : ''}`}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        type="number"
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}

                <p className="mt-1 text-center text-sm font-medium text-red-300">
                    00:{timer < 10 ? `0${timer}` : timer}
                </p>

                <Button
                    className="mt-4 w-full h-10 rounded-lg bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors shadow-sm"
                    onClick={handleOtpSubmit}
                >
                    Submit
                </Button>

                {timer === 0 && (
                    <p className="mt-3 text-center text-sm text-gray-400">
                        If you didn't receive a code!{" "}
                        <span
                            className="cursor-pointer text-gray-200 underline hover:text-white transition-colors"
                            onClick={handleResend}
                        >
                            Resend
                        </span>
                    </p>
                )}
            </FormLayout>
        </Wrapper>
    );
}

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-[#0f0f12] flex items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_50px_-10px_rgba(0,0,0,.6)] px-8 py-10 text-gray-100">
                {children}
            </div>
        </div>
    );
}
