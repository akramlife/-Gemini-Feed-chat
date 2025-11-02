import React from 'react';
import { CommaFeedSubscription } from '../types';
import { FeedSelector } from './FeedSelector';
import { LogoIcon, RefreshIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
    subscriptions: CommaFeedSubscription[];
    selectedSubscriptionId: number | null;
    onSelectSubscription: (id: number) => void;
    onLogout: () => void;
    onRefresh: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    subscriptions,
    selectedSubscriptionId,
    onSelectSubscription,
    onLogout,
    onRefresh,
    isDarkMode,
    toggleDarkMode,
}) => {
    return (
        <header className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-4">
                <LogoIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-grow">
                    <FeedSelector
                        subscriptions={subscriptions}
                        selectedSubscriptionId={selectedSubscriptionId}
                        onSelect={onSelectSubscription}
                    />
                </div>
                <button onClick={onRefresh} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Refresh feed">
                    <RefreshIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle dark mode">
                    {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-700" />}
                </button>
                 <button
                    onClick={onLogout}
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:border-gray-600"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};
