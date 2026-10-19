import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Shield, Radio, BookOpen, Music2, CalendarDays, Send, AlertCircle, Volume2, Globe } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [preferences, setPreferences] = useState({
    livestream: true,
    verses: true,
    events: true,
    songs: true,
    language: 'English'
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    try {
      const saved = localStorage.getItem('am-notification-prefs');
      if (saved) setPreferences(JSON.parse(saved));
    } catch {}
  }, []);

  const savePreferences = (newPrefs: any) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem('am-notification-prefs', JSON.stringify(newPrefs));
    } catch {}
    if (token) {
      setDoc(doc(db, 'push_subscriptions', token), {
        token,
        ...newPrefs,
        updatedAt: Date.now()
      }, { merge: true }).catch(() => {});
    }
  };

  const requestPermissionAndSubscribe = async () => {
    setSubscribing(true);
    try {
      if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications.');
        setSubscribing(false);
        return false;
      }

      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        const messaging = getMessaging();
        // VAPID key public key for FCM web push
        const currentToken = await getToken(messaging, {
          vapidKey: 'BEl42iUQLhL9T_Wp-6QzR7eYJ3Gg9Kx8QvR_m1K2L3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6a7b8c9d0e1f2g3h4i5j6k7l'
        }).catch(() => null);

        if (currentToken) {
          setToken(currentToken);
          await setDoc(doc(db, 'push_subscriptions', currentToken), {
            token: currentToken,
            ...preferences,
            updatedAt: Date.now()
          });
        }
        setSubscribing(false);
        return true;
      }
    } catch (e) {
      console.warn('Push subscription error:', e);
    }
    setSubscribing(false);
    return false;
  };

  return { permission, token, subscribing, preferences, savePreferences, requestPermissionAndSubscribe };
}

export function NotificationBellWithModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { permission, token, subscribing, preferences, savePreferences, requestPermissionAndSubscribe } = useNotifications();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'notification_history'), (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      setHistory(items.slice(0, 15));
    }, () => {});
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-shade" onClick={onClose}>
      <div 
        className="modal max-w-md bg-white rounded-2xl shadow-2xl p-6 relative text-neutral-900 text-left" 
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
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold leading-tight">Notification Center</h3>
            <p className="text-xs text-neutral-500">Anointing Ministries Live Push Alerts</p>
          </div>
        </div>

        {/* Permission Status Box */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-700">Browser Permission</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              permission === 'granted' ? 'bg-emerald-100 text-emerald-800' :
              permission === 'denied' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {permission.toUpperCase()}
            </span>
          </div>

          {permission !== 'granted' ? (
            <div>
              <p className="text-xs text-neutral-600 mb-3">
                Enable push notifications to receive instant updates when live worship begins, daily Bible verses in English & Tamil, and church updates.
              </p>
              <button 
                onClick={requestPermissionAndSubscribe}
                disabled={subscribing}
                className="btn gold text-xs w-full py-2.5 flex items-center justify-center gap-2"
              >
                {subscribing ? 'Enabling...' : 'Enable Push Notifications'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
              <Check size={16} /> Notifications are active and ready on this device.
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="space-y-3 mb-5">
          <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Subscription Preferences</h4>
          
          <label className="flex items-center justify-between text-xs cursor-pointer p-2 hover:bg-neutral-50 rounded-lg">
            <span className="flex items-center gap-2 font-medium text-neutral-800">
              <Radio size={15} className="text-red-600"/> YouTube Livestream Alerts
            </span>
            <input 
              type="checkbox" 
              checked={preferences.livestream} 
              onChange={e => savePreferences({ ...preferences, livestream: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-2 hover:bg-neutral-50 rounded-lg">
            <span className="flex items-center gap-2 font-medium text-neutral-800">
              <BookOpen size={15} className="text-amber-600"/> Daily Bible Verses (English & Tamil)
            </span>
            <input 
              type="checkbox" 
              checked={preferences.verses} 
              onChange={e => savePreferences({ ...preferences, verses: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-2 hover:bg-neutral-50 rounded-lg">
            <span className="flex items-center gap-2 font-medium text-neutral-800">
              <CalendarDays size={15} className="text-blue-600"/> Church Event Reminders
            </span>
            <input 
              type="checkbox" 
              checked={preferences.events} 
              onChange={e => savePreferences({ ...preferences, events: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer p-2 hover:bg-neutral-50 rounded-lg">
            <span className="flex items-center gap-2 font-medium text-neutral-800">
              <Music2 size={15} className="text-purple-600"/> New Worship Song Releases
            </span>
            <input 
              type="checkbox" 
              checked={preferences.songs} 
              onChange={e => savePreferences({ ...preferences, songs: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded"
            />
          </label>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-700 flex items-center gap-1.5">
              <Globe size={14}/> Preferred Verse Language
            </span>
            <select 
              value={preferences.language}
              onChange={e => savePreferences({ ...preferences, language: e.target.value })}
              className="border border-neutral-300 rounded px-2 py-1 text-xs bg-white font-medium"
            >
              <option value="English">English</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Both">Both / Bilingual</option>
            </select>
          </div>
        </div>

        {/* History */}
        <div>
          <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">Recent Notifications</h4>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {history.length > 0 ? history.map(item => (
              <div key={item.id} className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-xs">
                <div className="flex items-center justify-between font-bold text-neutral-900 mb-0.5">
                  <span>{item.title}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
                <p className="text-neutral-600 line-clamp-2">{item.body}</p>
              </div>
            )) : (
              <p className="text-xs text-neutral-400 text-center py-4">No recent notification history.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
