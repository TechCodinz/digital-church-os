import Link from 'next/link';
import { Heart, Shield, BookOpen, HelpCircle } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    {
      label: 'Ministry',
      items: [
        { href: '/scripture', label: 'Scripture Intelligence' },
        { href: '/presentation', label: 'Live Presentation' },
        { href: '/live-broadcast', label: 'Live Broadcast' },
        { href: '/worship-media', label: 'Worship Media' },
        { href: '/live-service', label: 'Live Service' },
        { href: '/prayer-room', label: 'Prayer Room' },
        { href: '/sermons', label: 'Sermon Studio' },
        { href: '/spiritual', label: 'AI Pastor' },
      ],
    },
    {
      label: 'Growth',
      items: [
        { href: '/journey', label: 'Spiritual Journey' },
        { href: '/activities', label: 'Sanctuary Activities' },
        { href: '/rewards', label: 'Rewards Wallet' },
        { href: '/bible-games', label: 'Bible Games' },
        { href: '/impact', label: 'Testimonies & Impact' },
        { href: '/sanctuary-host', label: 'AI Sanctuary Host' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { href: '/care', label: 'Human Care' },
        { href: '/workers', label: 'Church Workers' },
        { href: '/gifts', label: 'Gift Pools' },
        { href: '/command-center', label: 'Command Center' },
        { href: '/media-rights', label: 'Media Rights' },
        { href: '/release-readiness', label: 'Release Readiness' },
        { href: '/intelligence', label: 'Raizion Intelligence' },
        { href: '/council', label: 'AI Ministry Council' },
      ],
    },
    {
      label: 'Platform',
      items: [
        { href: '/offering', label: 'Give Offering' },
        { href: '/transparency', label: 'Transparency Report' },
        { href: '/church-network', label: 'Church Network' },
        { href: '/marketplace', label: 'Marketplace' },
        { href: '/website-builder', label: 'Website Builder' },
        { href: '/multilingual', label: 'Multilingual' },
        { href: '/mobile', label: 'Mobile/Offline' },
      ],
    },
  ];

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">Digital Church OS</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-4">
              A living sanctuary operating system for scripture, worship media, live broadcasts, media rights, care, rewards, workers, gifts, conferences, family discipleship, church networks, and global ministry growth.
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure · Private · Scripture-Grounded</span>
            </div>
          </div>

          {links.map((group) => (
            <div key={group.label}>
              <p className="text-white font-semibold text-sm uppercase tracking-widest mb-4">{group.label}</p>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-stone-400 hover:text-white transition-colors text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-800 pt-8 mb-6">
          <div className="flex items-start gap-3 text-sm text-stone-500 italic max-w-2xl mx-auto text-center justify-center">
            <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5 text-stone-600" />
            <p>"For where two or three gather in my name, there am I with them." — Matthew 18:20</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <p>© {currentYear} Digital Church OS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-stone-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-stone-400 transition-colors">Terms of Use</Link>
            <a href="mailto:support@digitalchurchos.com" className="hover:text-stone-400 transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
