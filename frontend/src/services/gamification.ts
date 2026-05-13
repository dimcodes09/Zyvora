// Simple fetch helpers — plug into your existing pages

export async function getUserGamification() {
  const res = await fetch("/api/user/me", { credentials: "include" }); 
  // points, streak, rewards are now part of your existing user object
  const data = await res.json();
  return {
    points: data.points ?? 0,
    streak: data.streak ?? 0,
    rewards: data.rewards ?? [],
  };
}

export async function redeemReward(rewardId: string) {
  const res = await fetch("/api/user/redeem", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rewardId }),
  });
  return res.json();
}