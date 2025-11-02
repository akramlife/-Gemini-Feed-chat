import { CommaFeedCredentials, CommaFeedSubscription, CommaFeedEntry, CommaFeedCategory } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?';

export class CommaFeedAPI {
    private userUrl: string;
    private authHeader: string;

    constructor(credentials: CommaFeedCredentials) {
        this.userUrl = credentials.url.endsWith('/') ? credentials.url.slice(0, -1) : credentials.url;
        this.authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password || ''}`);
    }

    private async request<T,>(endpoint: string): Promise<T> {
        let response;
        const fullApiUrl = `${this.userUrl}/rest${endpoint}`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(fullApiUrl)}`;

        try {
            response = await fetch(proxyUrl, {
                headers: {
                    'Authorization': this.authHeader,
                },
            });
        } catch (networkError) {
            console.error("Network error:", networkError);
            throw new Error(`Network error: Failed to fetch. Please verify the server URL and your network connection.`);
        }

        if (!response.ok) {
            const responseText = await response.text().catch(() => 'Could not read error response body.');
            console.error(`CommaFeed API error. Status: ${response.status}. Body: ${responseText}`);
            throw new Error(`CommaFeed API error: ${response.status} ${response.statusText}. Please check the server URL and credentials.`);
        }
        return response.json();
    }

    public async checkLogin(): Promise<void> {
        try {
            await this.request('/user/profile');
        } catch (error) {
            console.error("CommaFeed login check failed:", error);
            throw error; // Re-throw the specific error from request()
        }
    }

    public async getSubscriptions(): Promise<CommaFeedSubscription[]> {
        // The API returns a single root category object that contains nested children and feeds.
        const rootCategory = await this.request<CommaFeedCategory>('/category/get');
        
        const flattenFeeds = (cats: CommaFeedCategory[]): CommaFeedSubscription[] => {
            let feeds: CommaFeedSubscription[] = [];
            for (const category of cats) {
                feeds = feeds.concat(category.feeds);
                if (category.children && category.children.length > 0) {
                    feeds = feeds.concat(flattenFeeds(category.children));
                }
            }
            return feeds;
        };

        // Start with feeds at the root, then recursively find feeds in all child categories.
        const allFeeds = (rootCategory.feeds || []).concat(flattenFeeds(rootCategory.children || []));

        // Sort feeds alphabetically for easier navigation in the UI.
        allFeeds.sort((a, b) => a.name.localeCompare(b.name));

        return allFeeds;
    }

    public async getEntries(subscriptionId: number): Promise<CommaFeedEntry[]> {
        const response = await this.request<{ entries: CommaFeedEntry[] }>(`/feed/entries?id=${subscriptionId}&readType=unread&order=desc&limit=50`);
        return response.entries;
    }
}