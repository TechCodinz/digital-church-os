export const metadata = {
    title: 'Terms of Service — Digital Church OS',
    description: 'The terms that govern your use of Digital Church OS.',
};

const SECTIONS: { h: string; p: string }[] = [
    { h: '1. Acceptance of Terms', p: 'By accessing or using Digital Church OS ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.' },
    { h: '2. Spiritual & Pastoral Guidance', p: 'AI-assisted features (including the AI Pastor, Prayer Warrior, Counselor, and Apologist) offer scripture-grounded encouragement and are not a substitute for professional pastoral, medical, legal, or mental-health care. In a crisis, contact your local emergency services or a licensed professional.' },
    { h: '3. Community Conduct', p: 'You agree to engage prayerfully and respectfully. Do not post content that is abusive, deceptive, unlawful, or harmful to others. We may remove content or suspend accounts that violate this standard.' },
    { h: '4. Offerings & Giving', p: 'Contributions are processed by third-party providers and, where applicable, are subject to their terms. Purpose-based allocations are honored transparently through the Community Fund ledger.' },
    { h: '5. Privacy', p: 'Your use of the Platform is also governed by our Privacy Policy, which explains how we handle your information.' },
    { h: '6. Changes to These Terms', p: 'We may update these Terms from time to time. Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.' },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-28 pb-16">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-4xl font-light text-stone-800 mb-2">Terms of Service</h1>
                <p className="text-stone-500 mb-10 text-sm">Last updated: {new Date().getFullYear()}</p>
                <div className="space-y-8">
                    {SECTIONS.map((s) => (
                        <section key={s.h} className="sanctuary-card">
                            <h2 className="text-lg font-semibold text-stone-800 mb-2">{s.h}</h2>
                            <p className="text-stone-600 leading-relaxed text-sm">{s.p}</p>
                        </section>
                    ))}
                </div>
                <p className="text-center text-xs text-stone-400 mt-10">
                    Questions about these terms? Reach your church administrator through the Platform.
                </p>
            </div>
        </div>
    );
}
