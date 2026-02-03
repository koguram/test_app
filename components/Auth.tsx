import React, { useState } from 'react';
import { AuthView, User } from '../types';
// Firebaseから必要な機能をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// 【ここを差し替え！】Firebaseコンソールでコピーした自分の設定を貼るんだ！
const firebaseConfig = {
apiKey: "AIzaSyDds-xzK-whKpj4xBjI8IoOl-AWNTJRQ3g",
authDomain: "[test-project-f2595.firebaseapp.com](http://test-project-f2595.firebaseapp.com/)",
projectId: "test-project-f2595",
storageBucket: "test-project-f2595.firebasestorage.app",
messagingSenderId: "350544102622",
appId: "1:350544102622:web:a3b59dec2ba0a788a02e4f",
measurementId: "G-1QHW9GD374"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('entry');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ログイン処理をFirebase版に改造！
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      onLoginSuccess({ email: user.email || '', password: '' }); // パスワードは空でOK
    } catch (err: any) {
      setError('メールアドレスまたはパスワードが正しくありません。');
    }
  };

  // 新規登録処理をFirebase版に改造！
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Firebaseはデフォルトで6文字以上必要だからチェックを合わせるぜ
    if (password.length < 6) {
      setError('Firebaseの仕様により、パスワードは6文字以上必要だよ！');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      onLoginSuccess({ email: user.email || '', password: '' });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に登録されているよ！');
      } else {
        setError('エラーが発生したよ：' + err.message);
      }
    }
  };

  // --- 以下、元のUI部分はそのまま（onSubmitの向き先だけ共通化されてるぜ） ---
  if (view === 'entry') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl rotate-3">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">LifeRefine Coach</h1>
            <p className="text-slate-500">あなたの生活を、一歩ずつ確実に改善する。</p>
          </div>

          <div className="space-y-4 pt-8">
            <button
              onClick={() => setView('login')}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              ログイン
            </button>
            <button
              onClick={() => setView('register')}
              className="text-indigo-600 font-medium hover:underline text-sm"
            >
              新規会員登録はこちら
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <button 
          onClick={() => { setView('entry'); setError(''); }}
          className="mb-6 flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">戻る</span>
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {view === 'login' ? 'ログイン' : '新規登録'}
        </h2>

        <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">パスワード</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="6文字以上で入力"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md mt-4"
          >
            {view === 'login' ? 'ログイン' : '登録して開始'}
          </button>
        </form>
      </div>
    </div>
  );
};