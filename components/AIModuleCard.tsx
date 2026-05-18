'use client';

import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AIModuleCardProps {
    title: string;
    icon?: React.ReactNode;
    description?: string;
    scripture?: string;
    content?: string;
    tags?: string[];
    href?: string;
    safetyVerified?: boolean;
    accentColor?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

export function AIModuleCard({
    title,
    icon,
    description,
    scripture,
    content,
    tags = [],
    href,
    safetyVerified = false,
    accentColor = 'sage',
    onClick,
    children,
}: AIModuleCardProps) {
    const Card = (
        <motion.div
            whileHover={{ y: -2 }}
            onClick={onClick}
            className={`bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${onClick || href ? 'hover:border-sage-200' : ''}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-10 h-10 rounded-xl bg-${accentColor}-50 border border-${accentColor}-100 flex items-center justify-center flex-shrink-0`}>
                            {icon}
                        </div>
                    )}
                    <h3 className="font-semibold text-stone-800 leading-snug">{title}</h3>
                </div>
                {safetyVerified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex-shrink-0">
                        <ShieldCheck className="w-3 h-3" /> Safe
                    </span>
                )}
            </div>

            {/* Description */}
            {description && (
                <p className="text-stone-500 text-sm leading-relaxed mb-3">{description}</p>
            )}

            {/* Content */}
            {content && (
                <p className="text-stone-700 text-sm leading-relaxed mb-4 border-l-2 border-sage-200 pl-3 italic">{content}</p>
            )}

            {/* Scripture Reference */}
            {scripture && (
                <div className="flex items-center gap-2 mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">{scripture}</span>
                </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {tags.map(tag => (
                        <span key={tag} className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full border border-stone-200">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Custom children */}
            {children}

            {/* External link indicator */}
            {href && (
                <div className="flex items-center gap-1 mt-3 text-sage-600 text-xs font-semibold uppercase tracking-wide">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Open Module
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                </div>
            )}
        </motion.div>
    );

    if (href) {
        return <Link href={href}>{Card}</Link>;
    }

    return Card;
}

export default AIModuleCard;
