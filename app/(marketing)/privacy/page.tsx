export const metadata = {
    title: 'Privacy Policy — Digital Church OS',
    description: 'How Digital Church OS collects, uses, and protects your information.',
};

const SECTIONS: { h: string; p: string }[] = [
    { h: 'Our Commitment', p: 'Digital Church OS is built with dignity and confidentiality at its core. We collect only what is needed to serve you and never sell your personal information.' },
    { h: 'Information We Collect', p: 'Account details (name, email), content you create (prayers, journal entries, encouragements), and basic usage data used to improve the experience. Prayer requests marked private or anonymous are treated accordingly.' },
    { h: 'How We Use It', p: 'To provide spiritual features, connect you with community prayer, personalize encouragement, and maintain the transparency ledger for giving. AI features process your input to generate scripture-grounded responses.' },
    { h: 'Your Content & Visibility', p: 'You control the visibility of prayers (public, private, or anonymous). Private and anonymous content is never attributed to you publicly.' },
    { h: 'Third-Party Services', p: 'Some features rely on trusted providers (e.g. payments, email, optional AI providers). They process data only as needed to deliver the service and under their own privacy commitments.' },
    { h: 'Your Rights', p: 'You may request a copy of your data or deletion of your account at any time through your profile settings or by contacting your church administrator.' },
    { h: 'Security', p: 'We use industry-standard safeguards to protect your data. No method is perfectly secure, but we work continually to protect your trust.' },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-28 pb-16">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-4xl font-light text-stone-800 mb-2">Privacy Policy</h1>
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
                    "Come to me, all who are weary…and I will give you rest." — Matthew 11:28
                </p>
            </div>
        </div>
    );
}
