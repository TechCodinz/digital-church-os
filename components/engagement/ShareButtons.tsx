'use client';

import { motion } from 'framer-motion';
import { Share2, MessageCircle, Facebook, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
    url: string;
    text: string;
    className?: string;
}

export const ShareButtons = ({ url, text, className = "" }: ShareButtonsProps) => {
    const [copied, setCopied] = useState(false);

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-600 transition-colors"
                title="Share on WhatsApp"
            >
                <MessageCircle size={20} />
            </motion.a>

            <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                title="Share on Facebook"
            >
                <Facebook size={20} />
            </motion.a>

            <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-stone-800 text-white rounded-xl shadow-lg shadow-stone-100 hover:bg-stone-900 transition-colors"
                title="Share on Twitter"
            >
                <Twitter size={20} />
            </motion.a>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyToClipboard}
                className="p-3 bg-cream-100 text-stone-600 rounded-xl shadow-lg shadow-stone-50 hover:bg-cream-200 transition-colors border border-stone-200"
                title="Copy Link"
            >
                {copied ? <Check size={20} className="text-green-600" /> : <LinkIcon size={20} />}
            </motion.button>
        </div>
    );
};
