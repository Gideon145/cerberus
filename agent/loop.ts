/**
 * Cerberus — 3-Agent Autonomous Security Pipeline for Somnia Agentic L1
 *
 * Pipeline (60s heartbeat):
 *   OracleGuard → fetches 3 price sources, detects anomalies
 *   ThreatClassifier → LLM Inference classifies threat level
 *   CircuitBreaker → pauses protected contracts if CRITICAL
 *
 * Every decision produces a verifiable receipt via Somnia LLM Inference.
 */

import { ethers } from "ethers";
import * as http from "http";
import * as dotenv from "dotenv";
dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────

const RPC_URL = (process.env.SOMNIA_RPC || "https://testnet.somnia.network/rpc").trim();
const PRIVATE_KEY = (process.env.AGENT_PRIVATE_KEY || "").trim();
const SENTINEL_ADDRESS = (process.env.SENTINEL_ADDRESS || "").trim();
const STATUS_PORT = parseInt(process.env.STATUS_PORT || "3001");

// ── Wallets & Contracts ───────────────────────────────────────────────────────

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const SENTINEL_ABI = [
  "function protect(address target)",
  "function pauseContract(address target, uint8 level, bytes32 receiptId)",
  "function unpauseContract(address target)",
  "function isProtected(address target) view returns (bool)",
  "function isPaused(address target) view returns (bool)",
  "function getLatestAlerts(uint256 count) view returns (tuple(uint256 timestamp, address target, uint8 level, bytes32 receiptId)[])",
];

const sentinel = new ethers.Contract(SENTINEL_ADDRESS, SENTINEL_ABI, wallet);

// ── State ─────────────────────────────────────────────────────────────────────

interface PipelineStats {
  startTime: string;
  iterations: number;
  anomalies: number;
  criticals: number;
  pauses: number;
  lastIteration: string;
  events: string[];
}

const stats: PipelineStats = {
  startTime: new Date().toISOString(),
  iterations: 0,
  anomalies: 0,
  criticals: 0,
  pauses: 0,
  lastIteration: "",
  events: [],
};

function pushEvent(kind: string, msg: string) {
  const ts = new Date().toISOString().replace("T", " ").substring(0, 19);
  stats.events.unshift(`[${ts}] ${kind}: ${msg}`);
  if (stats.events.length > 200) stats.events.pop();
}

function log(kind: string, msg: string) {
  console.log(`[${kind.padEnd(16)}] ${msg}`);
  pushEvent(kind, msg);
}

// ── Price feeds to monitor ────────────────────────────────────────────────────

const PRICE_FEEDS = [
  { name: "CoinGecko", url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd" },
  { name: "Binance", url: "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT" },
  { name: "Coinbase", url: "https://api.coinbase.com/v2/prices/ETH-USD/spot" },
];

function extractPrice(data: any, source: string): number | null {
  try {
    if (source === "CoinGecko") return data.ethereum?.usd;
    if (source === "Binance") return parseFloat(data.price);
    if (source === "Coinbase") return parseFloat(data.data?.amount);
  } catch {}
  return null;
}

// ── Agent 1: OracleGuard ──────────────────────────────────────────────────────

interface OracleResult {
  anomaly: boolean;
  source: string;
  detail: string;
  prices: { name: string; price: number | null }[];
}

async function oracleGuard(): Promise<OracleResult> {
  const prices: { name: string; price: number | null }[] = [];

  for (const feed of PRICE_FEEDS) {
    try {
      const res = await fetch(feed.url);
      const data = await res.json();
      const p = extractPrice(data, feed.name);
      prices.push({ name: feed.name, price: p });
      log("OracleGuard", `${feed.name}: $${p?.toFixed(2) || "err"}`);
    } catch {
      prices.push({ name: feed.name, price: null });
      log("OracleGuard", `${feed.name}: fetch failed`);
    }
  }

  const validPrices = prices.filter((p) => p.price !== null).map((p) => p.price!);
  if (validPrices.length < 2) return { anomaly: false, source: "", detail: "insufficient data", prices };

  const avg = validPrices.reduce((a, b) => a + b) / validPrices.length;
  const maxDev = Math.max(...validPrices.map((p) => Math.abs(p - avg) / avg));
  const devPct = (maxDev * 100).toFixed(2);

  if (maxDev > 0.02) {
    return { anomaly: true, source: "price-feed", detail: `${devPct}% deviation across feeds`, prices };
  }
  return { anomaly: false, source: "", detail: "all feeds nominal", prices };
}

// ── Agent 2: ThreatClassifier ─────────────────────────────────────────────────

interface ClassificationResult {
  level: "NONE" | "LOW" | "MEDIUM" | "CRITICAL";
  receipt: string;
  reasoning: string;
}

async function threatClassifier(
  anomaly: OracleResult
): Promise<ClassificationResult> {
  // In production: invoke Somnia LLM Inference agent with ABI-encoded prompt
  // const result = await somniaClient.invokeLLM({
  //   model: "llama-3.2-1b",
  //   prompt: `Classify threat: ${anomaly.detail}. Options: NONE, LOW, MEDIUM, CRITICAL.`,
  //   temperature: 0.0  // deterministic output across validators
  // });

  // For now: rule-based classification (stand-in for Somnia LLM Inference)
  const devMatch = anomaly.detail.match(/([\d.]+)%/);
  const dev = devMatch ? parseFloat(devMatch[1]) : 0;

  let level: ClassificationResult["level"];
  let reasoning: string;

  if (dev > 10) {
    level = "CRITICAL";
    reasoning = `Deviation ${dev}% exceeds 10% threshold — likely oracle manipulation or exchange outage`;
  } else if (dev > 5) {
    level = "MEDIUM";
    reasoning = `Deviation ${dev}% — unusual but could be temporary volatility`;
  } else if (dev > 2) {
    level = "LOW";
    reasoning = `Deviation ${dev}% — minor, monitoring`;
  } else {
    level = "NONE";
    reasoning = "All feeds nominal";
  }

  // Simulate receipt hash (in production: from Somnia LLM Inference receipt)
  const receipt = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "uint256", "uint256"],
      [level, reasoning, Math.floor(Date.now() / 1000), Math.floor(dev) * 100]
    )
  );

  log("ThreatClassifier", `${level} — ${reasoning}`);
  return { level, receipt, reasoning };
}

// ── Agent 3: CircuitBreaker ───────────────────────────────────────────────────

async function circuitBreaker(
  target: string,
  level: string,
  receipt: string
): Promise<boolean> {
  if (level !== "CRITICAL") return false;

  const levelNum = { LOW: 1, MEDIUM: 2, CRITICAL: 3 }[level] || 1;

  try {
    const alreadyPaused = await sentinel.isPaused(target);
    if (alreadyPaused) {
      log("CircuitBreaker", `${target} already paused — skipping`);
      return false;
    }

    const tx = await sentinel.pauseContract(target, levelNum, receipt);
    await tx.wait();
    stats.pauses++;
    log("CircuitBreaker", `⚡ PAUSED ${target} | tx: ${tx.hash}`);
    return true;
  } catch (e: any) {
    log("CircuitBreaker", `FAILED: ${e.message?.slice(0, 80)}`);
    return false;
  }
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────

const PROTECTED_CONTRACTS = (process.env.PROTECTED_CONTRACTS || SENTINEL_ADDRESS).split(",").map((s) => s.trim());

async function runPipeline() {
  stats.iterations++;
  stats.lastIteration = new Date().toISOString();
  const ts = new Date().toISOString().slice(11, 19);

  console.log(`\n━━━ [${ts}] Iteration ${stats.iterations} ━━━`);

  // Step 1: OracleGuard
  const anomaly = await oracleGuard();

  // Step 2: ThreatClassifier
  if (anomaly.anomaly) {
    stats.anomalies++;
    log("PIPELINE", `⚠ Anomaly detected — classifying...`);
    const { level, receipt } = await threatClassifier(anomaly);

    // Step 3: CircuitBreaker
    if (level === "CRITICAL") {
      stats.criticals++;
      for (const target of PROTECTED_CONTRACTS) {
        await circuitBreaker(target, level, receipt);
      }
    }
  }
}

// ── HTTP Server (status + dashboard) ──────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";

function startServer() {
  const dashboardPath = path.join(__dirname, "..", "frontend", "index.html");

  http
    .createServer((req, res) => {
      // Dashboard
      if (req.url === "/" || req.url === "/dashboard") {
        try {
          const html = fs.readFileSync(dashboardPath, "utf-8");
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" });
          res.end(html);
          return;
        } catch {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end("<h1>Cerberus</h1><p>Dashboard file not found.</p>");
          return;
        }
      }

      // Status JSON
      const body = JSON.stringify(
        {
          ok: true,
          name: "Cerberus",
          agents: ["OracleGuard", "ThreatClassifier", "CircuitBreaker"],
          stats,
          protected: PROTECTED_CONTRACTS,
          chain: RPC_URL.includes("testnet") ? "Somnia Testnet" : "Somnia Mainnet",
          sentinel: SENTINEL_ADDRESS,
        },
        null,
        2
      );
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(body);
    })
    .listen(STATUS_PORT, () => {
      log("SERVER", `Status: http://localhost:${STATUS_PORT}`);
    });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║       🐕 CERBERUS — 3-Agent         ║");
  console.log("║    Autonomous Security Network       ║");
  console.log("╚══════════════════════════════════════╝");
  console.log("");
  console.log(`  Chain:       ${RPC_URL.includes("testnet") ? "Somnia Testnet (50312)" : "Somnia Mainnet (5031)"}`);
  console.log(`  Wallet:      ${wallet.address}`);
  console.log(`  Sentinel:    ${SENTINEL_ADDRESS}`);
  console.log(`  Protected:   ${PROTECTED_CONTRACTS.join(", ")}`);
  console.log(`  Interval:    60s`);
  console.log("");

  startServer();

  // Run immediately, then every 60s
  await runPipeline();
  setInterval(runPipeline, 60000);

  log("CERBERUS", "3 agents watching. 60s heartbeat.");
}

main().catch((e) => {
  console.error("Cerberus failed to start:", e);
  process.exit(1);
});
