import { set, get, del, values } from 'idb-keyval';

export interface OfflinePrayerRequest {
    id: string;
    title: string;
    content: string;
    visibility: string;
    createdAt: Date;
    synced: boolean;
}

export const offlineStorage = {
    // Save a prayer request locally
    async savePrayerRequest(prayer: OfflinePrayerRequest) {
        try {
            await set(`prayer-${prayer.id}`, {
                ...prayer,
                synced: false,
                createdAt: new Date()
            });
            console.log('Prayer saved offline:', prayer.id);
        } catch (error) {
            console.error('Failed to save prayer offline:', error);
        }
    },

    // Get all unsynced prayer requests
    async getUnsyncedPrayers(): Promise<OfflinePrayerRequest[]> {
        try {
            const allValues = await values();
            return (allValues as OfflinePrayerRequest[]).filter(item => !item.synced);
        } catch (error) {
            console.error('Failed to get offline prayers:', error);
            return [];
        }
    },

    // Mark as synced or delete
    async markAsSynced(id: string) {
        try {
            await del(`prayer-${id}`);
        } catch (error) {
            console.error('Failed to remove synced prayer:', id, error);
        }
    },

    // Check if online
    isOnline(): boolean {
        return typeof window !== 'undefined' ? window.navigator.onLine : true;
    },

    // Background sync logic (to be called when connection restored)
    async syncAll() {
        if (!this.isOnline()) return;

        const unsynced = await this.getUnsyncedPrayers();
        if (unsynced.length === 0) return;

        console.log(`Syncing ${unsynced.length} offline items...`);

        for (const prayer of unsynced) {
            try {
                const response = await fetch('/api/prayers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(prayer),
                });

                if (response.ok) {
                    await this.markAsSynced(prayer.id);
                }
            } catch (error) {
                console.error('Sync failed for item:', prayer.id, error);
            }
        }
    }
};
