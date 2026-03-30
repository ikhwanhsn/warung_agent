import { stubRouter } from "../libs/stubExpress.js";

export async function createLeaderboardRouter() {
  return stubRouter("routes/leaderboard");
}
