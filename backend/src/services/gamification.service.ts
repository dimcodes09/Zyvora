import { User } from '../models/User.js';

// ─── Point values per action ──────────────────────────────────

const POINT_MAP: Record<string, number> = {
  ORDER:       10,
  REVIEW:       5,
  LOGIN:        2,
  FIRST_ORDER: 20,
};

// ─── Reward milestones ────────────────────────────────────────

const MILESTONES = [
  { points: 50,  type: 'discount'      as const, value: 50  },
  { points: 100, type: 'free_delivery' as const, value: 0   },
  { points: 200, type: 'discount'      as const, value: 100 },
];

// ─── addUserPoints ────────────────────────────────────────────

export async function addUserPoints(userId: string, action: string) {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Add points
  const earned = POINT_MAP[action] ?? 0;
  user.points = (user.points ?? 0) + earned;

  console.log(`🎮 [Gamification] ${action} → +${earned} pts | Total: ${user.points}`);

  // 2. Check every milestone
  for (const milestone of MILESTONES) {
    if (user.points >= milestone.points) {

      // Check if this exact reward already exists (used or unused)
      const alreadyExists = user.rewards.some(
        (r) => r.type === milestone.type && r.value === milestone.value
      );

      if (!alreadyExists) {
        user.rewards.push({
          type:      milestone.type,
          value:     milestone.value,
          used:      false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        console.log(`🎁 [Reward Unlocked] ${milestone.type} ₹${milestone.value} for user ${userId}`);
      }
    }
  }

  // 3. Save
  await user.save();
}

// ─── updateUserStreak ─────────────────────────────────────────

export async function updateUserStreak(userId: string) {
  const user = await User.findById(userId);
  if (!user) return;

  const now  = new Date();
  const last = user.lastActive ? new Date(user.lastActive) : null;

  if (last) {
    const diffDays = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      user.streak = (user.streak ?? 0) + 1; // logged in yesterday → extend
    } else if (diffDays > 1) {
      user.streak = 1;                       // missed a day → reset
    }
    // diffDays === 0 → same day, no change
  } else {
    user.streak = 1; // first ever login
  }

  user.lastActive = now;
  await user.save();

  console.log(`🔥 [Streak] userId: ${userId} | streak: ${user.streak} | lastActive: ${now}`);
}