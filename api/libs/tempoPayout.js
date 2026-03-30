/**
 * @param {{ to: string, amountUsd: number, memo?: string }} [_opts]
 */
export async function sendTempoPayout(_opts) {
  return {
    success: false,
    error: "Tempo payout is not configured in this build.",
    transactionHash: "",
  };
}
