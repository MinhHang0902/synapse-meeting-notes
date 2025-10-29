'use client';

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
    const router = useRouter();
    const locale = useLocale();

    return (
        <Wrapper>
            <div className="mx-auto max-w-sm space-y-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15">
                    <CheckCircle2 className="text-emerald-400" size={28} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white">Your Password Successfully Changed</h2>
                    <p className="mt-1 text-sm text-gray-400">Sign in to your account with your new password</p>
                </div>
                <Button
                    className="w-full h-10 rounded-lg bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors shadow-sm"
                    onClick={() => router.push(`/${locale}/auth/sign-in`)}
                >
                    Sign In
                </Button>
            </div>
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