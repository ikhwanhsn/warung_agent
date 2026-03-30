import { stubRouter } from "../../libs/stubExpress.js";

export async function createAgentLeaderboardRouter() {
  return stubRouter("routes/agent/leaderboard");
}
