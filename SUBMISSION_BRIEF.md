# Cerberus — Submission Brief

### 3-Agent Autonomous Security on Somnia Agentic L1

**Three AI agents. One 60-second heartbeat. Zero trust required.**

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

**Functionality:** Deployed on Somnia Testnet. 23+ pipeline iterations without critical failure. 3 live price sources. Contract verified on-chain.

**Agent-First Design:** All 3 agents operate natively on Somnia. JSON API Request for data fetching. LLM Inference for deterministic classification. Agents discover anomalies, invoke each other, and act autonomously.

**Innovation:** First on-chain security sentinel using deterministic LLM for threat classification. Not rule-based — AI reasoning with verifiable cryptographic receipts.

**Autonomous Performance:** 60-second self-healing heartbeat. Error-isolated pipeline. Survives API failures and RPC drops. Runs indefinitely.

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
