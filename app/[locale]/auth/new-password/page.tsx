'use client';

import BackButton from "@/components/auth/BackButton";
import FormLayout from "@/components/auth/FormLayout";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { set } from "zod";

export default function NewPasswordPage() {
    const router = useRouter();
    const locale = useLocale();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSetNewPassword = async () => {
        if (newPassword !== confirmPassword) setError("Passwords do not match.");
        else {
            setError("");
            router.push(`/${locale}/auth/success`);
        }
    }

    return (
        <Wrapper>
            <BackButton />
            <FormLayout title="Set New Password" subtitle="Enter your new password to complete the reset process">
                <div>
                    <label className="text-sm text-gray-300">New Password</label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <PasswordField value={newPassword} onChange={setNewPassword} />
                    </div>
                </div>

                <div>
                    <label className="text-sm text-gray-300">Confirm New Password</label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <Input
                            type="password"
                            className="pl-9 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 rounded-lg"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button className="mt-5 w-full h-10 rounded-lg bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors shadow-sm" onClick={handleSetNewPassword}>
                    Save New Password
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