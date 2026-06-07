# Cerberus — Submission Brief

### 3-Agent Autonomous Security on Somnia Agentic L1

**Three AI agents. One 60-second heartbeat. Zero trust required.**

---

## What Is Cerberus?

Cerberus is an autonomous security network built on Somnia's Agentic L1. Three specialized AI agents — OracleGuard, ThreatClassifier, and CircuitBreaker — run a continuous 60-second pipeline that detects oracle anomalies, classifies threats via deterministic AI, and automatically pauses compromised contracts. Every decision produces a verifiable on-chain receipt.

It is not a monitoring tool or a static scanner. It is an immune system for smart contracts — always watching, always reasoning, always ready to act.

---

## The Problem It Solves

Smart contracts have no autonomous defense mechanism. When a Chainlink oracle is manipulated, a price feed diverges from consensus, or an exploit pattern emerges, no one detects it in real time. By the time a human notices and responds — funds are already gone. The 2023 Euler Finance hack drained $197 million in minutes.

Existing solutions are either reactive (post-exploit forensic analysis), centralized (a single monitoring bot that can be DDoSed or bribed), or rule-based (hardcoded thresholds that miss novel attacks). Cerberus replaces all three with autonomous AI agents that watch, reason, and protect — natively on Somnia.

---

## The Pipeline

```
📡 OracleGuard → 🧠 ThreatClassifier → ⚡ CircuitBreaker
   60s scan          LLM Inference         Auto-pause
```

OracleGuard fetches ETH/USD from 3 independent sources (CoinGecko, Binance, CryptoCompare). When any feed diverges >2%, ThreatClassifier uses Somnia's deterministic LLM to classify the threat. If CRITICAL, CircuitBreaker pauses the protected contract on-chain — embedding a verifiable receipt for permanent audit.

---

## Somnia Primitives Used

| Primitive | Agent | Purpose |
|---|---|---|
| JSON API Request | OracleGuard | Fetch live price data from 3 external APIs |
| LLM Inference | ThreatClassifier | Deterministic AI threat classification with consensus-verified outputs |
| Verifiable Receipts | All 3 agents | Every anomaly, classification, and pause proven on-chain |

---

## On-Chain Proof

**Agent Wallet:** `0x94A4365E6B7E79791258A3Fa071824BC2b75a394`  
**Sentinel Contract:** `0x87E3D9fcfA4eff229A65d045A7C741E49b581187`  
**Chain:** Somnia Testnet (50312)

**Live Transactions:**

| Action | Tx Hash |
|---|---|
| protect() — Register contract for monitoring | `0xd22a8de50626b7902b4fed3879213e50ea41572a5f85105677d3d11fed0b4655` |
| unpauseContract() — Reset for fresh demo | `0x76ed43595135667fa3943b86ee68450a9eaa529f9a70e23e543c6e9bcb59e5de` |

---

## Judging Criteria

| Criterion | How Cerberus Delivers |
|---|---|
| **Functionality** | Deployed on Somnia Testnet. 10+ pipeline iterations. Contract verified on-chain. |
| **Agent-First** | All 3 agents use Somnia primitives. Discover anomalies, invoke each other, act autonomously. |
| **Innovation** | First deterministic LLM for on-chain security classification with verifiable receipts. |
| **Autonomous** | 60s heartbeat, self-healing, survives failures. Runs indefinitely. |

---

## What Makes It Different

Most security tools are reactive (scan after deployment) or rule-based (hardcoded thresholds). Cerberus uses deterministic AI to reason about threats in real time, with every decision producing a verifiable receipt proving the AI caught it autonomously. It is not a scanner — it is an immune system.

Traditional monitoring relies on a single bot that can be DDoSed, bribed, or coerced. Cerberus distributes detection, classification, and response across three specialized agents — each running independently, each with verifiable outputs. No single point of failure. No single point of trust.

---

## Links

- **GitHub:** https://github.com/Gideon145/cerberus
- **Live Demo:** https://cerberus-production-8429.up.railway.app
- **Demo Video:** https://youtube.com/shorts/oDqEUR_oynA
- **Presentation:** https://cerberus-production-8429.up.railway.app/presentation

---

## Stack

Solidity 0.8.20 · TypeScript (Node.js) · Somnia JSON API Request · Somnia LLM Inference · ethers.js v6 · Railway · Single-file HTML dashboard

---

*"Smart contracts have no immune system. Cerberus is that immune system."*
