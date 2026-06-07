# Cerberus — 3-Agent Autonomous Security on Somnia

**AI-powered security sentinel. Three agents. One heartbeat. Zero trust.**

> *"Three AI agents watch your contracts. 24/7. Verifiably."*

[![Somnia](https://img.shields.io/badge/Somnia-Agentic%20L1-8b5cf6)](https://somnia.network) [![Encode](https://img.shields.io/badge/Encode-Agentathon%202026-blue)](https://www.encodeclub.com/programmes/agentathon) [![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)

🎥 **Demo Video:** *(add link)*

---

## What Is Cerberus?

Cerberus is a **3-agent autonomous security network** built on Somnia's Agentic L1. Three specialized agents run a 60-second pipeline — detecting anomalies, classifying threats via deterministic AI, and automatically pausing compromised contracts.

No human in the loop. Every decision produces a **verifiable receipt** proving the AI caught it autonomously.

---

## The Problem

Smart contracts have no immune system. When an oracle is compromised, a price feed diverges, or an exploit pattern emerges, there's no autonomous mechanism to detect it and respond. By the time humans notice, funds are gone.

---

## The Solution — 3-Agent Pipeline

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   OracleGuard    │────▶│ ThreatClassifier  │────▶│ CircuitBreaker │
│   (60s scan)     │     │  (LLM Inference)  │     │  (auto-pause)  │
│                  │     │                   │     │                │
│ • 3 price feeds  │     │ • Deterministic   │     │ • Pauses       │
│ • Anomaly detect │     │   AI classifies   │     │   protected    │
│ • CoinGecko +    │     │   threat level    │     │   contracts    │
│   Binance +      │     │ • NONE / LOW /    │     │ • On-chain     │
│   Coinbase       │     │   MEDIUM /        │     │   receipt      │
│                  │     │   CRITICAL        │     │   proof         │
└─────────────────┘     └──────────────────┘     └────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
  verifiable receipt       verifiable receipt       verifiable receipt
```

### Agent 1: OracleGuard

Fetches ETH/USD from **3 independent sources** (CoinGecko, Binance, Coinbase) every 60 seconds. Detects when any feed diverges from the consensus by more than 2%.

### Agent 2: ThreatClassifier

Uses **Somnia LLM Inference** — a deterministic AI model running on validator nodes — to classify the threat level. Same input always produces the same output across all validators, enabling consensus-verified threat classification. Outputs: NONE, LOW, MEDIUM, or CRITICAL with a verifiable receipt hash.

### Agent 3: CircuitBreaker

Watches ThreatClassifier output. When a CRITICAL threat is detected, it **automatically pauses protected contracts** on-chain. Every pause produces a transaction with the receipt ID embedded, creating a permanent audit trail.

---

## Somnia Agentic L1 Integration

| Somnia Primitive | Agent | Usage |
|---|---|---|
| **JSON API Request** | OracleGuard | Fetches price data from 3 external APIs every 60s |
| **LLM Inference** | ThreatClassifier | Deterministic AI classifies threat severity with verifiable receipts |
| **Verifiable Receipts** | All 3 agents | Every anomaly, classification, and pause produces a receipt on-chain |

---

## Live Deployment

| Service | URL |
|---|---|
| Status API | `http://localhost:3001` (JSON) |
| Dashboard | `http://localhost:3001/dashboard` |
| Sentinel Contract | Somnia Testnet (50312) |

---

## Agent Loop Deep Dive

```
Interval: 60 seconds (configurable)

Step 1: OracleGuard
  └─ fetch(CoinGecko) → $1,853.42
  └─ fetch(Binance)   → $1,852.98
  └─ fetch(Coinbase)  → $1,853.11
  └─ avg: $1,853.17 | max dev: 0.02% → NOMINAL

Step 2: ThreatClassifier (triggered if anomaly)
  └─ LLM Inference: "Classify threat: 15.3% deviation across feeds"
  └─ → CRITICAL (receipt: 0x7a3b...)

Step 3: CircuitBreaker (triggered if CRITICAL)
  └─ pauseContract(0xPROTECTED, CRITICAL, 0x7a3b...)
  └─ tx: 0x9c2d... | ⚡ CONTRACT PAUSED
```

---

## Running Locally

### Prerequisites

- Node.js >= 18
- Somnia testnet wallet with STT (claim at [Somnia Faucet](https://testnet.somnia.network))
- Git

### 1. Clone & Install

```bash
git clone https://github.com/Gideon145/cerberus.git
cd cerberus
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

```env
SOMNIA_RPC=https://testnet.somnia.network/rpc
AGENT_PRIVATE_KEY=0x...        # your wallet key
SENTINEL_ADDRESS=0x...         # after deploy
PROTECTED_CONTRACTS=0xABC...   # contracts to protect
```

### 3. Deploy Contract

```bash
npm run compile
npm run deploy
# Copy the deployed address to .env → SENTINEL_ADDRESS
```

### 4. Start the Agents

```bash
npm run agent
```

### 5. Open Dashboard

**http://localhost:3001** — 3 agent cards + live event log

---

## Hackathon

Built for the **Somnia Agentathon** by Encode Club (June 2026).

| Detail | Value |
|---|---|
| **Prize Pool** | $5,000 USD |
| **Track** | Build the most novel and high-impact agent-driven application on Somnia |
| **Deadline** | June 10, 2026 |
| **Platform** | Somnia Agentic L1 |

### Judging Criteria

| Criterion | How Cerberus Delivers |
|---|---|
| **Functionality** | 60s pipeline, reliable oracle scanning, on-chain contract pausing — tested and stable |
| **Agent-First Design** | All 3 agents operate autonomously — discover anomalies, invoke each other, act without humans |
| **Innovation** | First on-chain security sentinel using Somnia's deterministic LLM for threat classification with verifiable receipts |
| **Autonomous Performance** | Self-healing pipeline, 60s heartbeat, runs indefinitely — zero human intervention |

---

## Architecture

```
                    ┌─────────────────────────────┐
                    │    Somnia Agentic L1         │
                    │  (Deterministic LLM + JSON   │
                    │   API Request Agents)         │
                    └─────────────┬───────────────┘
                                  │ receipts
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
   ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
   │  OracleGuard     │  │ ThreatClassifier │  │ CircuitBreaker   │
   │  3 price feeds   │  │ LLM Inference    │  │ Contract pause   │
   │  anomaly detect  │  │ threat classify  │  │ on-chain tx      │
   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                     ┌───────────▼───────────┐
                     │  CerberusSentinel.sol  │
                     │  (Somnia Testnet)      │
                     │  • protect()           │
                     │  • pauseContract()     │
                     │  • getLatestAlerts()   │
                     └───────────────────────┘
```

---

## License

MIT — see [LICENSE](LICENSE)
