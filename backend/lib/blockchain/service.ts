import { createWalletClient, createPublicClient, http, hexToBigInt } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Chain } from "viem";
import { polygonAmoy } from "viem/chains";
import { hasBlockchain } from "@/lib/demo/mode";
import { computeRecordHash, verifyRecordHash, type CanonicalRecordInput } from "@/lib/chain/hash";

/**
 * Blockchain service (viem) — anchors complaint record hashes to a public
 * testnet (Polygon Amoy / Ethereum Sepolia) using an application wallet.
 *
 * Citizens never need a wallet. Only complaint ID + record hash + timestamp
 * go on-chain — never names, emails, phones, raw images or full complaints.
 *
 * When blockchain env vars are absent, `registerProof`/`verifyOnChain`
 * fall back to DEMO MODE (locally simulated hashes), and the UI labels them
 * clearly as demo proofs.
 */

export interface RegisteredProof {
  transactionHash: string;
  blockNumber: number;
  dataUri: string;
}

const CHAIN_OPTIONS: Record<string, Chain> = {
  "80002": polygonAmoy,
};

function getChain(): Chain {
  const chainId = process.env.BLOCKCHAIN_CHAIN_ID ?? "80002";
  return CHAIN_OPTIONS[chainId] ?? polygonAmoy;
}

/** A tiny contract ABI exposing the fields the dashboard needs. */
export const CitiFixRegistryABI = [
  {
    inputs: [
      { name: "complaintId", type: "string" },
      { name: "recordHash", type: "bytes32" },
      { name: "dataUri", type: "string" },
    ],
    name: "anchorProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "complaintId", type: "string" },
      { name: "recordHash", type: "bytes32" },
    ],
    name: "verifyProof",
    outputs: [{ name: "valid", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "complaintId", type: "string" }],
    name: "getProof",
    outputs: [
      { name: "recordHash", type: "bytes32" },
      { name: "timestamp", type: "uint256" },
      { name: "dataUri", type: "string" },
      { name: "anchoredBy", type: "address" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Compute + register a proof of a complaint record on-chain.
 * Only the canonical hash and a data URI (never PII) are stored.
 */
export async function registerProof(
  input: CanonicalRecordInput,
  dataUri: string,
): Promise<RegisteredProof & { recordHash: string }> {
  // The exact same canonical SHA-256 routine is used when the proof is later
  // verified. Do not introduce a second serialization format here.
  const recordHash = await computeRecordHash(input);
  const chain = getChain();

  if (!hasBlockchain()) {
    // DEMO MODE: simulate a realistic tx hash & block from the record hash.
    return {
      recordHash,
      transactionHash: `0x${recordHash.slice(0, 24)}${recordHash.slice(24, 32)}${recordHash.slice(8, 16)}demo`,
      blockNumber: Math.floor(Date.now() / 1000) % 9_000_000 + 4_100_000,
      dataUri,
    };
  }

  const rpc = process.env.BLOCKCHAIN_RPC_URL!;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY! as `0x${string}`;
  const contract = process.env.BLOCKCHAIN_CONTRACT_ADDRESS! as `0x${string}`;

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain, transport: http(rpc) });

  const tx = await walletClient.writeContract({
    address: contract,
    abi: CitiFixRegistryABI,
      functionName: "anchorProof",
    args: [input.complaintNumber, `0x${recordHash}` as `0x${string}`, dataUri],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  return {
    recordHash,
    transactionHash: tx,
    blockNumber: Number(receipt.blockNumber),
    dataUri,
  };
}

/** Read the anchored hash for a complaint from the contract. */
export async function verifyOnChain(
  expectedHash: string,
  _complaintId?: string,
): Promise<{ exists: boolean; matches: boolean; onChainHash: string | null }> {
  if (!hasBlockchain()) {
    // DEMO MODE: compare the provided hash against itself (no chain lookup).
    return {
      exists: Boolean(expectedHash),
      matches: Boolean(expectedHash),
      onChainHash: expectedHash,
    };
  }

  const rpc = process.env.BLOCKCHAIN_RPC_URL!;
  const contract = process.env.BLOCKCHAIN_CONTRACT_ADDRESS! as `0x${string}`;
  const publicClient = createPublicClient({ chain: getChain(), transport: http(rpc) });

  try {
    const result = await publicClient.readContract({
      address: contract,
      abi: CitiFixRegistryABI,
        functionName: "getProof",
      args: [_complaintId ?? ""],
    });
      // getProof returns [recordHash, timestamp, dataUri, anchoredBy, exists]
      const onChainHash = (result[0] as `0x${string}`).slice(2);
      const exists = result[4] as boolean;
      if (!exists) return { exists: false, matches: false, onChainHash: null };
      const matches = onChainHash.toLowerCase() === expectedHash.toLowerCase();
      return { exists: true, matches, onChainHash };
    } catch {
      return { exists: false, matches: false, onChainHash: null };
    }
}

export { verifyRecordHash, hexToBigInt };

/** Format a tx hash for display. */
export function formatTxHash(hash: string): string {
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash;
}
