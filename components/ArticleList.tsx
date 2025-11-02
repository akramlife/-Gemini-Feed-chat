import React from 'react';
import { CommaFeedEntry } from '../types';

interface ArticleListProps {
  entries: CommaFeedEntry[];
}

export const ArticleList: React.FC<ArticleListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return null; 
  }

  return (
    <div className="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 px-1">Recent Articles</h2>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {entries.map(entry => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            title={entry.title}
          >
            {entry.title}
          </a>
        ))}
      </div>
    </div>
  );
};
