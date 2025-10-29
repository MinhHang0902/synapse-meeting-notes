'use client';

import BackButton from "@/components/auth/BackButton";
import FormLayout from "@/components/auth/FormLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { set } from "zod";

export default function OtpPage() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const id = setInterval(() => setTimer((t) => t > 0 ? t - 1 : 0), 1000);
        return () => clearInterval(id);
    }, []);

    const handleOtpSubmit = () => {
        if (otp !== "123456") setError("Invalid OTP. Please try again.");
        else {
            setError("");
            router.push("/auth/new-password");
        }
    }

    return (
        <Wrapper>
            <BackButton />
            <FormLayout title="Forgot Password?" subtitle="Enter your 6 digits code that you received on your email.">
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input
                        className={`pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 rounded-lg ${error ? 'border-red-400' : ''}`}
                        placeholder="794920"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <p className="mt-1 text-center text-sm font-medium text-red-300">00:{timer < 10 ? `0${timer}` : timer}</p>
                <Button className="mt-4 w-full h-10 rounded-lg bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors shadow-sm" onClick={handleOtpSubmit}>
                    Submit
                </Button>
                <p className="mt-3 text-center text-sm text-gray-400">
                    If you didn't receive a code! <span className="cursor-pointer text-gray-200 underline hover:text-white transition-colors">Resend</span>
                </p>
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