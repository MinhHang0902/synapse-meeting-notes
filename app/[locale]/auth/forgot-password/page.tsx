'use client';

import BackButton from "@/components/auth/BackButton";
import FormLayout from "@/components/auth/FormLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const locale = useLocale();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleForgotPassword = async () => {
        if (!email) setError("Please enter your email address.");
        else {
            setError("");
            router.push(`/${locale}/auth/otp`);
        }
    }

    return (
        <Wrapper>
            <BackButton />
            <FormLayout title="Forgot Password?" subtitle="Enter your email to reset your password.">
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <Input
                        className="pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 rounded-lg"
                        placeholder="example@synapse.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button className="mt-4 w-full h-10 rounded-lg bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors shadow-sm" onClick={handleForgotPassword}>
                    Submit
                </Button>
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