import React, { useState, useEffect, useCallback } from 'react';
import { Login } from './components/Login';
import { ChatView } from './components/ChatView';
import { Header } from './components/Header';
import { ArticleList } from './components/ArticleList';
import { CommaFeedAPI } from './services/commafeedService';
import { generateAnswer } from './services/geminiService';
import useLocalStorage from './hooks/useLocalStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { CommaFeedCredentials, ChatMessage, CommaFeedSubscription, CommaFeedEntry } from './types';

function App() {
    const [credentials, setCredentials] = useLocalStorage<CommaFeedCredentials | null>('commafeed-creds', null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [apiClient, setApiClient] = useState<CommaFeedAPI | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode | null>(null);

    const [subscriptions, setSubscriptions] = useState<CommaFeedSubscription[]>([]);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
    const [entries, setEntries] = useState<CommaFeedEntry[]>([]);
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);

    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const handleApiError = (err: any) => {
        const errorMessage = err.message || 'An unknown error occurred.';
        if (errorMessage.includes('Failed to fetch')) {
             setError('Login failed. Please double-check your server URL and ensure you have an active internet connection.');
        } else {
            setError(errorMessage);
        }
    };

    const fetchEntries = useCallback((subId: number, client: CommaFeedAPI) => {
         setLoading(true);
         setEntries([]); 
         setError(null);
         client.getEntries(subId)
             .then(newEntries => {
                 setEntries(newEntries);
                 const feedName = subscriptions.find(s => s.id === subId)?.name || 'the feed';
                 setMessages([{
                     id: 'system-1',
                     role: 'system',
                     content: `Now viewing entries from "${feedName}". The recent articles are listed above. Ask me anything!`
                 }]);
             })
             .catch(err => setError(`Failed to fetch entries: ${err.message}`))
             .finally(() => setLoading(false));
    }, [subscriptions]);

    // Effect to auto-login if credentials are in local storage
    useEffect(() => {
        if (credentials && !apiClient) {
            const client = new CommaFeedAPI(credentials);
            setLoading(true);
            client.checkLogin()
                .then(() => {
                    setApiClient(client);
                    setIsLoggedIn(true);
                })
                .catch((err: any) => {
                    console.error("Auto-login failed:", err);
                    handleApiError(err);
                    setCredentials(null); // Clear invalid credentials
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [credentials, apiClient, setCredentials]);

    // Effect to fetch subscriptions when logged in
    useEffect(() => {
        if (isLoggedIn && apiClient) {
            setLoading(true);
            apiClient.getSubscriptions()
                .then(subs => {
                    setSubscriptions(subs);
                    if (subs.length > 0 && !selectedSubscriptionId) {
                        const firstSubId = subs[0].id;
                        setSelectedSubscriptionId(firstSubId);
                    }
                })
                .catch(err => setError(`Failed to fetch subscriptions: ${err.message}`))
                .finally(() => setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, apiClient]);

    // Effect to fetch entries when subscription changes
    useEffect(() => {
        if (selectedSubscriptionId && apiClient) {
            fetchEntries(selectedSubscriptionId, apiClient);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubscriptionId, apiClient]);

    const handleLogin = async (creds: CommaFeedCredentials, remember: boolean) => {
        setLoading(true);
        setError(null);
        const client = new CommaFeedAPI(creds);
        try {
            await client.checkLogin();
            if (remember) {
                setCredentials(creds);
            }
            setApiClient(client);
            setIsLoggedIn(true);
        } catch (err: any) {
            handleApiError(err);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        setCredentials(null);
        setIsLoggedIn(false);
        setApiClient(null);
        setSubscriptions([]);
        setSelectedSubscriptionId(null);
        setEntries([]);
        setMessages([]);
    };

    const handleSendMessage = useCallback(async (content: string) => {
        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content };
        setMessages(prev => [...prev, userMessage]);
        setIsGeminiLoading(true);

        if (entries.length === 0) {
            const systemMessage: ChatMessage = {
                id: 'error-' + Date.now(),
                role: 'system',
                content: 'There are no articles in the current feed to analyze. Please select another feed or try again later.',
            };
            setMessages(prev => [...prev, systemMessage]);
            setIsGeminiLoading(false);
            return;
        }

        try {
            const answer = await generateAnswer(entries, content);
            const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: answer };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err: any) {
            const errorMessage: ChatMessage = { id: 'error-' + Date.now(), role: 'system', content: `Error: ${err.message}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGeminiLoading(false);
        }
    }, [entries]);
    
    const handleRefreshEntries = useCallback(() => {
        if (selectedSubscriptionId && apiClient) {
            fetchEntries(selectedSubscriptionId, apiClient);
        }
    }, [selectedSubscriptionId, apiClient, fetchEntries]);


    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} loading={loading} error={error} />;
    }

    return (
        <div className="h-screen w-screen max-w-2xl mx-auto flex flex-col font-sans">
            <Header 
                subscriptions={subscriptions}
                selectedSubscriptionId={selectedSubscriptionId}
                onSelectSubscription={(id) => {
                    setError(null);
                    setSelectedSubscriptionId(id);
                }}
                onLogout={handleLogout}
                onRefresh={handleRefreshEntries}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />
            <ArticleList entries={entries} />
            {error && <div className="p-2 text-center text-sm text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300">{String(error)}</div>}
            <main className="flex-1 overflow-hidden">
                <ChatView
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isGeminiLoading}
                />
            </main>
        </div>
    );
}

export default App;
