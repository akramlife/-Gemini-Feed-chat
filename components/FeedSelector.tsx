import React from 'react';
import { CommaFeedSubscription } from '../types';

interface FeedSelectorProps {
    subscriptions: CommaFeedSubscription[];
    selectedSubscriptionId: number | null;
    onSelect: (id: number) => void;
}

export const FeedSelector: React.FC<FeedSelectorProps> = ({ subscriptions, selectedSubscriptionId, onSelect }) => {
    return (
        <select
            value={selectedSubscriptionId ?? ''}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Select a feed"
        >
            <option value="" disabled>Select a feed</option>
            {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                    {sub.name}
                </option>
            ))}
        </select>
    );
};
