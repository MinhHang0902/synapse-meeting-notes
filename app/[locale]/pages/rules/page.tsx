import ProtectedLayout from "@/components/layouts/ProtectedLayout";

export default function RulesPage() {
    return (
        <ProtectedLayout>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <main className="flex-1 overflow-auto p-8">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-4xl font-bold mb-8 text-gray-900">Synapse Platform Rules</h1>

                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">1. Respectful Conduct</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        All users must engage in respectful and courteous behavior. Any form of harassment, hate speech, or
                                        discrimination will not be tolerated. Treat others as you would like to be treated.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">2. Appropriate Content</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        Users are responsible for the content they upload. Do not share or promote illegal, offensive,
                                        explicit, or harmful material. This includes but is not limited to text, audio, and links.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">3. Privacy and Security</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        Respect the privacy of others and do not share personal information without consent. Be cautious about
                                        the recordings and transcripts you upload, and report any suspicious activity immediately.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">4. Authenticity</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        Users must represent themselves truthfully. Do not use fake identities or impersonate others.
                                        Authenticity is key to building trust within the community.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">5. Intellectual Property</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        Respect intellectual property rights. Do not upload or distribute content that you do not have the
                                        right to use. If you believe your rights are violated, report it promptly.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">6. Compliance with Laws</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        Users must adhere to all applicable local, national, and international laws. Any activity that
                                        violates the law will result in immediate action and may be reported to the relevant authorities.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </main>
                </div>
        </ProtectedLayout>

    )
}
