'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────

interface Reward {
  _id: string;
  type: 'discount' | 'free_delivery';
  value: number;
  used: boolean;
  expiresAt?: string;
}

interface GamificationData {
  points: number;
  streak: number;
  rewards: Reward[];
}

type ApiError = {
  message?: string;
};

// ─── Helpers ──────────────────────────────────────────────────

function rewardLabel(reward: Reward): string {
  if (reward.type === 'free_delivery') return '🚚 Free Delivery';
  return `₹${reward.value} OFF`;
}

// ─── Component ────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as ApiError).message ?? 'Something went wrong');
  }
  return 'Something went wrong';
}

export default function GamificationCard() {
  const { user, hydrated } = useAuthStore();

  const [open, setOpen]       = useState(false);
  const [data, setData]       = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast, setToast]     = useState<string | null>(null);

  // ── Fetch gamification data via the shared axios instance ────
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      try {
        // api instance auto-attaches Authorization: Bearer <token>
        const { data: json } = await api.get('/auth/me');
        if (json.success) {
          setData({
            points:  json.data.points  ?? 0,
            streak:  json.data.streak  ?? 0,
            rewards: json.data.rewards ?? [],
          });
        } else {
          console.warn('GamificationCard: /api/auth/me returned', json);
        }
      } catch (err) {
        console.error('Failed to fetch gamification data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // ── Redeem reward ──────────────────────────────────────────
  async function handleRedeem(rewardId: string) {
    setRedeeming(rewardId);
    try {
      // api instance auto-attaches Authorization: Bearer <token>
      const { data: json } = await api.post('/user/redeem', { rewardId });

      if (json.success) {
        setData((prev) => {
          if (!prev) return prev;

          return {
            points: json.points ?? prev.points,
            streak: json.streak ?? prev.streak,
            rewards:
              json.rewards ??
              prev.rewards.map((r) =>
                r._id === rewardId ? { ...r, used: true } : r
              ),
          };
        });
        showToast('Reward redeemed! 🎉');
      } else {
        showToast(json.message ?? 'Failed to redeem');
      }
    } catch (err: unknown) {
      showToast(getErrorMessage(err));
    } finally {
      setRedeeming(null);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Next milestone hint ────────────────────────────────────
  function nextMilestone(points: number): string {
    if (points < 50)  return `${50  - points} pts to ₹50 discount`;
    if (points < 100) return `${100 - points} pts to Free Delivery`;
    if (points < 200) return `${200 - points} pts to ₹100 discount`;
    return 'All rewards unlocked! 🏆';
  }

  // ─── Don't render at all unless auth is ready + user logged in ───
  if (!hydrated || !user) return null;

  return (
    <>
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes gc-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .gc-panel {
          animation: gc-slide-up 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        .gc-redeem-btn:hover:not(:disabled) {
          background: #3a1a1a !important;
          transform: scale(1.03);
        }
        .gc-redeem-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .gc-toggle:hover { transform: scale(1.1); }
      `}</style>

      {/* ── Floating toggle button ── */}
      <button
        className="gc-toggle"
        onClick={() => setOpen((o) => !o)}
        title="My Rewards"
        style={{
          position:     'fixed',
          bottom:       100,   // sits above FloatingChat
          right:        24,
          zIndex:       9000,
          width:        48,
          height:       48,
          borderRadius: '50%',
          border:       'none',
          background:   'linear-gradient(135deg,#C96B7A,#7B1728)',
          color:        '#fff',
          fontSize:     22,
          cursor:       'pointer',
          boxShadow:    '0 4px 18px rgba(123,23,40,0.40)',
          transition:   'transform 0.2s ease',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
        }}
      >
        🎮
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          className="gc-panel"
          style={{
            position:     'fixed',
            bottom:       158,   // above the toggle button
            right:        24,
            zIndex:       9001,
            width:        340,
            maxHeight:    '70vh',
            overflowY:    'auto',
            background:   '#fff',
            border:       '1px solid #e5e7eb',
            borderRadius: 16,
            padding:      20,
            boxShadow:    '0 12px 40px rgba(0,0,0,0.14)',
            fontFamily:   'inherit',
          }}
        >
          {/* Toast */}
          {toast && (
            <div style={{
              position:     'absolute',
              top:          12,
              right:        12,
              background:   '#111',
              color:        '#fff',
              padding:      '8px 14px',
              borderRadius: 8,
              fontSize:     13,
              fontWeight:   500,
              zIndex:       10,
            }}>
              {toast}
            </div>
          )}

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111' }}>🎮 My Rewards</h3>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', lineHeight: 1 }}
              title="Close"
            >
              ×
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Loading rewards…</p>
          ) : !data ? (
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Could not load rewards.</p>
          ) : (
            <>
              {/* Stats Row */}
              <div style={{
                display:      'flex',
                alignItems:   'center',
                gap:          16,
                marginBottom: 12,
                background:   '#f9fafb',
                borderRadius: 10,
                padding:      '12px 16px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 2 }}>
                  <span style={{ fontSize: 22 }}>💰</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{data.points}</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Points</span>
                </div>
                <div style={{ width: 1, height: 40, background: '#e5e7eb' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 2 }}>
                  <span style={{ fontSize: 22 }}>🔥</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{data.streak}</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Day Streak</span>
                </div>
              </div>

              {/* Progress hint */}
              <p style={{
                fontSize:     12,
                color:        '#6b7280',
                margin:       '0 0 16px',
                padding:      '6px 10px',
                background:   '#fef9c3',
                borderRadius: 6,
                display:      'inline-block',
              }}>
                👉 {nextMilestone(data.points)}
              </p>

              {/* Rewards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.rewards.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                    No rewards yet. Keep earning points!
                  </p>
                ) : (
                  data.rewards.map((reward) => (
                    <div
                      key={reward._id}
                      style={{
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'space-between',
                        padding:        '10px 14px',
                        border:         '1px solid #e5e7eb',
                        borderRadius:   8,
                        background:     '#fafafa',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#111', display: 'block' }}>
                          {rewardLabel(reward)}
                        </span>
                        {reward.expiresAt && !reward.used && (
                          <span style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginTop: 2 }}>
                            Expires {new Date(reward.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {reward.used ? (
                        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>Redeemed ✅</span>
                      ) : (
                        <button
                          className="gc-redeem-btn"
                          disabled={redeeming === reward._id}
                          onClick={() => handleRedeem(reward._id)}
                          style={{
                            background:   '#7B1728',
                            color:        '#fff',
                            border:       'none',
                            borderRadius: 6,
                            padding:      '6px 14px',
                            fontSize:     13,
                            fontWeight:   600,
                            cursor:       'pointer',
                            transition:   'background 0.2s, transform 0.15s',
                          }}
                        >
                          {redeeming === reward._id ? 'Redeeming…' : 'Redeem'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
