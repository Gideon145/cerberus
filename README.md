# Cerberus

**3-Agent Autonomous Security Sentinel on Somnia Agentic L1**

> GitHub: https://github.com/Gideon145/cerberus
> Demo: *(add YouTube link)*
> Live: https://cerberus-production-8429.up.railway.app
> Presentation: https://cerberus-production-8429.up.railway.app/presentation
> CV: [Opukeme-Gideon-Somnia.pdf](./CV-Opukeme-Gideon-Somnia.pdf)

[![Somnia](https://img.shields.io/badge/Somnia-Agentic%20L1-8b5cf6)](https://somnia.network) [![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)](https://soliditylang.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/) [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Project Overview

Cerberus is not a single security scanner — it is a **three-agent autonomous pipeline** that detects oracle anomalies, classifies threats via deterministic AI, and automatically pauses compromised contracts. All on Somnia Agentic L1. All verifiable.

**Why this matters:** Smart contracts have no immune system. When an oracle is manipulated, a price feed diverges, or an exploit pattern emerges, there is no autonomous mechanism to detect it and respond. By the time humans notice, funds are gone. Cerberus is that immune system.

**Core differentiators:**

- **3-Agent pipeline** — OracleGuard → ThreatClassifier → CircuitBreaker, 60s loop
- **Deterministic LLM classification** — Somnia's consensus-verified AI assigns threat levels
- **Verifiable receipts** — every anomaly, classification, and pause produces an on-chain receipt
- **Circuit breaker** — contracts auto-paused when CRITICAL threats detected
- **Self-healing** — pipeline runs indefinitely without human intervention
- **Somnia-native** — JSON API Request + LLM Inference as first-class primitives

---

## System Architecture

```
                    ┌─────────────────────────────────┐
                    │       Somnia Agentic L1          │
                    │  (Deterministic LLM + JSON API)  │
                    └───────────────┬─────────────────┘
                                    │ receipts
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
   ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
   │  OracleGuard     │    │ ThreatClassifier │    │ CircuitBreaker   │
   │  (60s scan)      │───▶│ (LLM Inference)  │───▶│ (auto-pause)     │
   │                  │    │                  │    │                  │
   │ • 3 price feeds  │    │ • NONE → LOW →   │    │ • pauseContract  │
   │ • anomaly detect │    │   MED → CRITICAL │    │ • on-chain tx     │
   │ • >2% deviation  │    │ • deterministic  │    │ • receipt proof   │
   └──────────────────┘    └──────────────────┘    └──────────────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
                     ┌──────────────▼──────────────┐
                     │   CerberusSentinel.sol       │
                     │   (Somnia Testnet 50312)     │
                     │                              │
                     │ • protect(address)           │
                     │ • pauseContract(target,      │
                     │     level, receiptId)        │
                     │ • getLatestAlerts(count)     │
                     └─────────────────────────────┘
```

---

## Agent Pipeline

### Agent 1: OracleGuard
| Property | Value |
|---|---|
| **Role** | Price feed anomaly detection |
| **Cycle** | 60 seconds |
| **Somnia Primitive** | JSON API Request |
| **Sources** | CoinGecko, Binance, CryptoCompare |
| **Threshold** | >2% deviation |

Fetches ETH/USD from 3 independent sources. Detects when any feed diverges from consensus by >2%.

### Agent 2: ThreatClassifier
| Property | Value |
|---|---|
| **Role** | Threat severity classification |
| **Trigger** | OracleGuard anomaly detected |
| **Somnia Primitive** | LLM Inference |
| **Outputs** | NONE, LOW, MEDIUM, CRITICAL |

Uses Somnia's deterministic LLM — same input always produces the same output across validator nodes, enabling consensus-verified threat classification.

### Agent 3: CircuitBreaker
| Property | Value |
|---|---|
| **Role** | Autonomous contract protection |
| **Trigger** | CRITICAL classification |
| **Somnia Primitive** | Verifiable Receipts |

When CRITICAL: calls `pauseContract()` on-chain, embedding the receipt ID for a permanent audit trail.

---

## Agent Loop

```
Interval: 60s

Step 1: OracleGuard
  └─ CoinGecko: $1,853.42 | Binance: $1,852.98 | CryptoCompare: $1,853.11
  └─ avg: $1,853.17 | max dev: 0.02% → NOMINAL

Step 2: ThreatClassifier (if anomaly)
  └─ LLM: "Classify: 15.3% deviation across feeds"
  └─ → CRITICAL | receipt: 0x7a3b...

Step 3: CircuitBreaker (if CRITICAL)
  └─ pauseContract(0xPROTECTED, CRITICAL, 0x7a3b...)
  └─ tx: 0x9c2d... | ⚡ CONTRACT PAUSED
```

| Deviation | Level | Action |
|---|---|---|
| <2% | NONE | Normal |
| 2-5% | LOW | Logged |
| 5-10% | MEDIUM | Alert |
| >10% | CRITICAL | Auto-pause |

---

## Smart Contract

`CerberusSentinel.sol` — Solidity 0.8.20

| Function | Description |
|---|---|
| `protect(address)` | Register contract for monitoring |
| `pauseContract(target, level, receiptId)` | Pause with threat level + receipt |
| `unpauseContract(address)` | Restore paused contract |
| `isProtected(address)` | Check protection status |
| `isPaused(address)` | Check pause status |
| `getLatestAlerts(count)` | Recent alerts with timestamps + receipts |

```solidity
struct Alert {
    uint256 timestamp;
    address target;
    ThreatLevel level;   // NONE, LOW, MEDIUM, CRITICAL
    bytes32 receiptId;   // Somnia LLM receipt
}
```

---

## Deployment

Contract on **Somnia Testnet (Chain ID 50312)**.

| Item | Value |
|---|---|
| RPC | `https://api.infra.testnet.somnia.network` |
| Chain ID | 50312 |
| Sentinel | `0x87E3D9fcfA4eff229A65d045A7C741E49b581187` |

---

## Dashboard

4-tab live dashboard served by the agent at `http://localhost:3001`. No framework. Single-file HTML. Zero build step.

| Tab | Content |
|---|---|
| **Overview** | 7 metric cards (sources, iterations, anomalies, criticals, pauses, ETH/USD, demo controls). Recent event log with color-coded entries and real-time stats footer showing iteration count, anomaly count, and source health (3/3). One-click "Simulate Anomaly" button injects a fake 15.3% deviation — full pipeline fires on the next 60s cycle. |
| **Pipeline** | 3 agent detail cards showing each agent's Somnia primitive, threshold, and current status. Pipeline flow bar: OracleGuard → ThreatClassifier → CircuitBreaker with metadata (60s loop, Deterministic LLM, Verifiable Receipts). Event log with stats footer. |
| **Event Log** | Full scrollable event history with 5 filters — All, Critical, Medium, OracleGuard, Errors. Monospace font, timestamped entries, color-coded by severity. |
| **About** | Protocol description, agent wallet address, sentinel contract, chain, RPC. Grid layout with copy-paste-friendly values. |

Auto-refresh every 2 seconds via `/status` polling. Color-coded events. Number pulse-on-change animation. Animated radial gradient background. Hover glow on metric cards.

---

## Security Model

Cerberus implements defense-in-depth for autonomous contract protection. The pipeline is designed to survive failures, resist false positives, and leave a permanent verifiable audit trail.

### Pipeline Error Isolation
Each agent runs independently. A failure in one iteration never crashes the server. Errors are logged, the interval continues. The pipeline has survived 35+ consecutive iterations without interruption.

### Conservative Thresholds
CRITICAL classification triggers only at >10% deviation across 3 independent price feeds. LOW and MEDIUM threats are logged but never trigger the circuit breaker — preventing false positives from unnecessary pauses.

| Deviation | Level | Action |
|---|---|---|
| <2% | NONE | Normal operation — pipeline logs and continues |
| 2–5% | LOW | Logged to event stream, dashboard updated |
| 5–10% | MEDIUM | Alert raised, increased monitoring |
| >10% | CRITICAL | CircuitBreaker auto-pauses protected contracts on-chain |

### Owner-Gated Protection
Only the agent wallet can call `pauseContract()` and `unpauseContract()`. Contracts must be explicitly registered via `protect()` before they can be paused. No external address can trigger a pause.

### Receipt Audit Trail
Every CRITICAL pause embeds a Somnia LLM Inference receipt hash on-chain — permanent, verifiable proof of what triggered the decision, when it happened, and which AI classification produced it. The 2023 Euler Finance hack drained $197M in minutes; an autonomous agent like Cerberus could have detected the anomaly and paused the protocol before the second transaction landed.

### Self-Healing
The pipeline continues running even if Somnia RPC drops, a price feed API fails, or the contract is unreachable. Degraded paths are surfaced to the event log — never papered over. The agent doesn't fake liveness.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Agent Runtime | TypeScript, Node.js, 60s autonomous loop |
| Somnia Primitives | JSON API Request, LLM Inference, Verifiable Receipts |
| Data Sources | CoinGecko, Binance, CryptoCompare (3 independent feeds) |
| Dashboard | Single-file HTML/JS, auto-refresh 2s, 4-tab interface |
| Deployment | Railway (agent), GitHub (source), one-click deploy |

---

## Quick Start

```bash
git clone https://github.com/Gideon145/cerberus.git
cd cerberus
npm install
cp .env.example .env   # fill AGENT_PRIVATE_KEY
npm run compile
npm run deploy          # → copy address to .env SENTINEL_ADDRESS
npm run agent           # → open http://localhost:3001
```

---

## Somnia Integration

| Somnia Primitive | Agent | Usage |
|---|---|---|
| **JSON API Request** | OracleGuard | Fetch price data from 3 APIs every 60s |
| **LLM Inference** | ThreatClassifier | Deterministic AI threat classification |
| **Verifiable Receipts** | All agents | Every action proven on-chain |

---

## Project Structure

```
cerberus/
├── contracts/
│   └── CerberusSentinel.sol        # On-chain protection contract
├── agent/
│   └── loop.ts                     # 3-agent pipeline
├── frontend/
│   └── index.html                  # Dashboard served by agent
├── scripts/
│   └── deploy.ts                   # Hardhat deployment
├── hardhat.config.ts               # Somnia testnet + mainnet config
├── package.json
└── .env.example
```

---

## Demo

**What to show:**
1. Agent boot — 3 agents initialize, wallet address displayed
2. Dashboard overview — live ETH price from 3 sources
3. Pipeline tab — agent detail cards with Somnia primitive badges
4. Simulated anomaly — ThreatClassifier detects, CircuitBreaker pauses
5. Event log — filter by Critical to see pause with receipt hash

---

## Submission Details

**Hackathon:** Encode Club × Somnia Agentathon (June 2026)

**Challenge:** Build a novel, high-impact agent-driven application demonstrating agent autonomy, composability, and real-world utility.

**How Cerberus addresses the challenge:**
- Somnia JSON API Request + LLM Inference as first-class primitives
- 3-agent autonomous pipeline — zero human intervention
- Deterministic AI threat classification with verifiable on-chain receipts
- Real-world utility: oracle manipulation detection + contract circuit breaker
- Agent-native: agents discover anomalies, invoke each other, act independently

---

## Team

| Role | GitHub |
|---|---|
| Solo Developer | [Gideon145](https://github.com/Gideon145) |

One contract. Three agents. One pipeline. Built for Somnia Agentathon.

## License

MIT
