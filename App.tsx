
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CoachSummary, User } from './types';
import { CoachingService } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';

const coachingService = new CoachingService();

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<Partial<CoachSummary> | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check login status on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('refine_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentUser) {
      scrollToBottom();
    }
  }, [messages, isProcessing, currentUser]);

  // Initial greeting when logged in
  useEffect(() => {
    if (currentUser && messages.length === 0) {
      const init = async () => {
        setIsProcessing(true);
        const initialMessage: ChatMessage = {
          role: 'model',
          text: `こんにちは、${currentUser.email}さん。生活改善コーチです。今日は、あなたの生活の中で少し変えたいなと思っていることや、なんとなくうまくいっていないと感じている点についてお伺いできればと思います。\n\n「もっと早起きしたい」「ついダラダラしてしまう」「作業環境が整っていない」など、どんな些細なことでも構いません。まずは現状、気になっていることを教えていただけますか？`
        };
        setMessages([initialMessage]);
        setIsProcessing(false);
      };
      init();
    }
  }, [currentUser, messages.length]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('refine_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMessages([]);
    setSummary(null);
    sessionStorage.removeItem('refine_current_user');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsProcessing(true);

    try {
      const responseText = await coachingService.getResponse(newMessages);
      const modelMsg: ChatMessage = { role: 'model', text: responseText };
      const updatedMessages = [...newMessages, modelMsg];
      setMessages(updatedMessages);

      if (updatedMessages.length >= 3) {
        updateSummary(updatedMessages);
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "すみません、少し通信が不安定なようです。もう一度お願いできますか？" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSummary = async (currentHistory: ChatMessage[]) => {
    setIsSummarizing(true);
    try {
      const jsonStr = await coachingService.extractSummary(currentHistory);
      const parsed = JSON.parse(jsonStr);
      setSummary(prev => ({ ...prev, ...parsed }));
    } catch (e) {
      console.error("Failed to parse summary JSON", e);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">LifeRefine Coach</h1>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px] md:max-w-none">{currentUser.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ログアウト
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto md:p-6 gap-6">
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden order-2 md:order-1">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
            {isProcessing && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="コーチに状況を話す..."
                disabled={isProcessing}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 text-slate-700 shadow-inner"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Dashboard Area */}
        <aside className="w-full md:w-80 lg:w-96 flex flex-col order-1 md:order-2 h-[35vh] md:h-auto overflow-hidden">
          <Dashboard summary={summary} isLoading={isSummarizing} />
        </aside>

      </main>
    </div>
  );
};

export default App;
