
export interface CommaFeedCredentials {
  url: string;
  username: string;
  password?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface CommaFeedSubscription {
  id: number;
  name: string;
}

export interface CommaFeedEntry {
  id: string;
  guid: string;
  title: string;
  content: string;
  url: string;
  feedName: string;
  date: string;
}

// Raw type from Commafeed API for categories and subscriptions
export interface CommaFeedCategory {
  id: string;
  name: string;
  feeds: CommaFeedSubscription[];
  children: CommaFeedCategory[];
}
