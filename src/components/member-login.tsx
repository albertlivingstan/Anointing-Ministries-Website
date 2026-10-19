import React, { useState, useEffect } from 'react';
import { User, LogIn, LogOut, Check, X, Shield, Bell } from 'lucide-react';
import { membersDatabase, type Member } from '../members';

export function useMemberAuth() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('am-logged-member');
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch {}
  }, []);

  const login = (nameInput: string, dobInput: string) => {
    const cleanName = nameInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanDob = dobInput.trim();

    const found = membersDatabase.find(m => {
      const dbNameClean = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return dbNameClean === cleanName && m.dob === cleanDob;
    });

    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem('am-logged-member', JSON.stringify(found));
      } catch {}
      return { success: true, member: found };
    }
    return { success: false, error: 'Invalid name or Date of Birth (YYYY-MM-DD).' };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('am-logged-member');
    } catch {}
  };

  return { currentUser, login, logout };
}

export function MemberLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser, login, logout } = useMemberAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = login(name, dob);
    if (res.success && res.member) {
      setSuccessMsg(`Welcome, ${res.member.name}! You are now logged in.`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1800);
    } else if ('error' in res && res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="modal-shade" onClick={onClose}>
      <div 
        className="modal max-w-sm bg-white rounded-2xl shadow-2xl p-6 relative text-neutral-900 text-left"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition"
          aria-label="Close modal"
        >
          <X size={18}/>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold leading-tight">Member Login</h3>
            <p className="text-xs text-neutral-500">Optional · Enable notifications & updates</p>
          </div>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <Check size={32} className="mx-auto text-emerald-600 mb-2" />
              <h4 className="font-serif font-bold text-emerald-900 text-base">Welcome back, {currentUser.name}!</h4>
              <p className="text-xs text-emerald-700 mt-1">You are logged in and subscribed to church push notifications.</p>
            </div>
            <button 
              onClick={() => { logout(); onClose(); }}
              className="btn outline w-full text-xs py-2.5 flex items-center justify-center gap-2 text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs text-center font-medium">
                {successMsg}
              </div>
            )}
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-800 text-xs text-center">
                {error}
              </div>
            )}

            <label className="block text-xs font-semibold text-neutral-700">
              Your Full Name (Username)
              <input 
                required 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. S Elisa David Pratap"
                className="w-full mt-1 border border-neutral-300 rounded-lg px-3 py-2 text-xs"
              />
            </label>

            <label className="block text-xs font-semibold text-neutral-700">
              Date of Birth (Password — YYYY-MM-DD)
              <input 
                required 
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full mt-1 border border-neutral-300 rounded-lg px-3 py-2 text-xs"
              />
            </label>

            <button 
              type="submit"
              className="btn gold w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <LogIn size={15} /> Login to Fellowship
            </button>

            <p className="text-[11px] text-neutral-400 text-center">
              Login is entirely optional. You can browse all church content without logging in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
