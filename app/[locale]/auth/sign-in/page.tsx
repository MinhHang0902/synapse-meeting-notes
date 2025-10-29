'use client';

import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthApi } from "@/lib/api/auth";
import { setAccessToken, setRefreshToken } from "@/lib/utils/cookies";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
    const router = useRouter();
    const locale = useLocale();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignIn = async () => {
        try {
            const data = await AuthApi.signIn({ email, password });
            if (!data?.accessToken) {
                setError("Không nhận được access token từ máy chủ.");
                return;
            }

            setAccessToken(data.accessToken);
            if (data.refreshToken) setRefreshToken(data.refreshToken);

            router.push(`/${locale}/pages/dashboard`);
        } catch (error: any) {
            const message =
                error?.response?.data?.error?.message ||
                error?.message ||
                "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.";
            setError(message);
        }
    };

    return (
        <Wrapper>
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
                            placeholder="you@synapse.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">Password</label>
                        <PasswordField value={password} onChange={setPassword} className={error ? 'border-red-400' : ''} />
                    </div>

                    {error && <p className="text-center text-sm text-red-400">{error}</p>}

                    <Button
                        onClick={handleSignIn}
                        className="w-full h-10 rounded-lg bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors shadow-sm"
                    >
                        Sign in
                    </Button>

                    <Link
                        href={`/${locale}/auth/forgot-password`}
                        className="w-full text-center text-sm text-gray-300 hover:text-white hover:underline transition-colors block"
                    >
                        Forgot Password?
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <p className="text-center text-xs text-gray-500">
                        You acknowledge that you read, and agree, to our{' '}
                        <span className="underline cursor-pointer hover:text-gray-400 transition-colors">Terms of Service</span> and our{' '}
                        <span className="underline cursor-pointer hover:text-gray-400 transition-colors">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </Wrapper>
    );
}

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_10%_10%,#1f1f22_0%,transparent_60%),radial-gradient(900px_600px_at_90%_20%,#232326_0%,transparent_60%)] bg-[#0f0f12] flex items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_50px_-10px_rgba(0,0,0,.6)] px-8 py-10 text-gray-100">
                {children}
            </div>
        </div>
    );
}