// AudioPlayer — fetches a short-lived signed URL from the backend, then plays
// the file. The raw audio_file_path is a private Supabase Storage path and
// cannot be used directly as an <audio> src.
import { useState, useEffect } from 'react';
import { Volume2, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export default function AudioPlayer({ sessionId }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchSignedUrl() {
      setLoading(true);
      setError(null);
      try {
        const stored = localStorage.getItem('talkalign_auth');
        const token = stored ? JSON.parse(stored).token : null;
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(
          `${API_URL}/sessions/${sessionId}/audio-url`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message || `Error ${res.status}`);
        }
        const { data } = await res.json();
        if (!cancelled) setUrl(data.url);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSignedUrl();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading audio recording…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-xs py-2">
        <AlertCircle className="w-4 h-4" />
        Audio unavailable: {error}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Volume2 className="w-4 h-4 text-brand-500" />
        Session Recording
      </div>
      <audio controls className="w-full rounded-xl" src={url}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
