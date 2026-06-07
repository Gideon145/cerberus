// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CerberusSentinel — 3-agent autonomous security for Somnia
 * @notice Protected contracts are paused by the CircuitBreaker agent
 *         when OracleGuard detects anomalies and ThreatClassifier confirms.
 *
 * ┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
 * │ OracleGuard  │ ──▶ │ ThreatClassifier │ ──▶ │ CircuitBreaker │
 * │ (60s scan)   │     │ (LLM Inference)  │     │ (pause/alert)  │
 * └─────────────┘     └──────────────────┘     └────────────────┘
 */
contract CerberusSentinel {
    address public owner;

    // Contracts under protection
    mapping(address => bool) public protected;
    mapping(address => bool) public paused;

    // Threat levels from ThreatClassifier agent
    enum ThreatLevel { NONE, LOW, MEDIUM, CRITICAL }

    // Event log for the dashboard
    struct Alert {
        uint256 timestamp;
        address target;
        ThreatLevel level;
        bytes32 receiptId;
    }
    Alert[] public alerts;

    event ContractProtected(address indexed target);
    event ContractPaused(address indexed target, ThreatLevel level, bytes32 receiptId);
    event ContractUnpaused(address indexed target);
    event ThreatDetected(address indexed target, ThreatLevel level, bytes32 receiptId, uint256 alertIndex);

    modifier onlyOwner() {
        require(msg.sender == owner, "Cerberus: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a contract for protection
     * @param target Address of the contract to monitor
     */
    function protect(address target) external onlyOwner {
        require(!protected[target], "Already protected");
        protected[target] = true;
        emit ContractProtected(target);
    }

    /**
     * @notice Remove protection from a contract
     */
    function unprotect(address target) external onlyOwner {
        require(protected[target], "Not protected");
        protected[target] = false;
    }

    /**
     * @notice Called by CircuitBreaker agent when CRITICAL threat detected
     * @param target Address to pause
     * @param level Threat severity from LLM classification
     * @param receiptId Verifiable receipt from Somnia LLM Inference agent
     */
    function pauseContract(
        address target,
        ThreatLevel level,
        bytes32 receiptId
    ) external onlyOwner {
        require(protected[target], "Not protected");
        require(!paused[target], "Already paused");

        paused[target] = true;
        uint256 idx = alerts.length;

        alerts.push(Alert({
            timestamp: block.timestamp,
            target: target,
            level: level,
            receiptId: receiptId
        }));

        emit ContractPaused(target, level, receiptId);
        emit ThreatDetected(target, level, receiptId, idx);
    }

    /**
     * @notice Unpause a contract after threat resolved
     */
    function unpauseContract(address target) external onlyOwner {
        require(paused[target], "Not paused");
        paused[target] = false;
        emit ContractUnpaused(target);
    }

    // --- View functions for dashboard ---

    function isProtected(address target) external view returns (bool) {
        return protected[target];
    }

    function isPaused(address target) external view returns (bool) {
        return paused[target];
    }

    function getAlertCount() external view returns (uint256) {
        return alerts.length;
    }

    /**
     * @notice Returns the latest N alerts for the dashboard
     */
    function getLatestAlerts(uint256 count) external view returns (Alert[] memory) {
        uint256 total = alerts.length;
        uint256 n = count > total ? total : count;
        Alert[] memory result = new Alert[](n);
        for (uint256 i = 0; i < n; i++) {
            result[i] = alerts[total - n + i];
        }
        return result;
    }
}
