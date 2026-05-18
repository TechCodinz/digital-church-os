'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const controls = useAnimation();

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || window.scrollY > 0) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY);

        // Resistance effect: exponential-like slowdown as you pull further
        const resistance = 0.5;
        const constrainedDistance = Math.min(distance * resistance, 80);

        setPullDistance(constrainedDistance);

        if (constrainedDistance > 10) {
            controls.set({ y: constrainedDistance });
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 50 && !refreshing) {
            setRefreshing(true);
            setPullDistance(0);
            await controls.start({ y: 40 });

            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
                await controls.start({ y: 0 });
            }
        } else {
            setPullDistance(0);
            await controls.start({ y: 0 });
        }
        setStartY(0);
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden min-h-full"
        >
            <motion.div
                className="absolute top-0 left-0 right-0 flex justify-center items-center h-10 pointer-events-none"
                animate={{ opacity: pullDistance > 10 || refreshing ? 1 : 0 }}
            >
                <motion.div
                    animate={refreshing ? { rotate: 360 } : { rotate: pullDistance * 4 }}
                    transition={refreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }}
                >
                    <RefreshCcw size={20} className="text-sage-500" />
                </motion.div>
            </motion.div>

            <motion.div animate={controls} className="min-h-full">
                {children}
            </motion.div>
        </div>
    );
};
