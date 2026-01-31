// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StrategyNFT.sol";
import "./Ranking.sol";
import "./interfaces/IZeroGCompute.sol";

/**
 * @title Arena
 * @notice Verifiable AI Trading Arena - 核心竞技场合约
 * @dev 管理策略注册、计算任务、结果验证和奖励分配
 */
contract Arena is Ownable, ReentrancyGuard {
    StrategyNFT public strategyNFT;
    Ranking public ranking;

    uint256 public constant VERSION = 1;
    uint256 public strategyCount;
    uint256 public registrationFee = 0.01 ether;

    enum StrategyStatus { Pending, Active, Inactive, Banned }

    struct Strategy {
        uint256 id;
        uint256 tokenId;
        address owner;
        string name;
        string description;
        bytes32 codeHash;
        string daStorageUrl;
        uint256 createdAt;
        uint256 lastComputed;
        StrategyStatus status;
    }

    struct Performance {
        uint256 totalReturn;
        uint256 sharpeRatio;
        uint256 maxDrawdown;
        uint256 winRate;
        uint256 tradesCount;
        uint256 lastUpdated;
    }

    struct Verification {
        bytes32 daRoot;
        bytes32 computeProof;
        bool verified;
        uint256 verifiedAt;
    }

    mapping(uint256 => Strategy) public strategies;
    mapping(uint256 => Performance) public performances;
    mapping(uint256 => Verification) public verifications;
    mapping(address => uint256[]) public userStrategies;

    event StrategyRegistered(
        uint256 indexed strategyId,
        uint256 indexed tokenId,
        address indexed owner,
        string name
    );

    event ComputeTaskSubmitted(
        uint256 indexed strategyId,
        bytes32 taskId
    );

    event ResultVerified(
        uint256 indexed strategyId,
        bytes32 computeProof
    );

    event PerformanceUpdated(
        uint256 indexed strategyId,
        uint256 totalReturn
    );

    modifier onlyStrategyOwner(uint256 strategyId) {
        require(
            strategies[strategyId].owner == msg.sender,
            "Not strategy owner"
        );
        _;
    }

    modifier onlyActiveStrategy(uint256 strategyId) {
        require(
            strategies[strategyId].status == StrategyStatus.Active,
            "Strategy not active"
        );
        _;
    }

    constructor(address _strategyNFT) Ownable(msg.sender) {
        strategyNFT = StrategyNFT(_strategyNFT);
    }

    function registerStrategy(
        string calldata name,
        string calldata description,
        bytes32 codeHash,
        string calldata daStorageUrl
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= registrationFee, "Insufficient fee");
        require(bytes(name).length > 0, "Name required");
        require(codeHash != bytes32(0), "Invalid code hash");

        uint256 strategyId = ++strategyCount;

        uint256 tokenId = strategyNFT.mintStrategy(
            msg.sender,
            name,
            description,
            daStorageUrl
        );

        strategies[strategyId] = Strategy({
            id: strategyId,
            tokenId: tokenId,
            owner: msg.sender,
            name: name,
            description: description,
            codeHash: codeHash,
            daStorageUrl: daStorageUrl,
            createdAt: block.timestamp,
            lastComputed: 0,
            status: StrategyStatus.Active
        });

        performances[strategyId] = Performance({
            totalReturn: 10000,
            sharpeRatio: 0,
            maxDrawdown: 0,
            winRate: 0,
            tradesCount: 0,
            lastUpdated: block.timestamp
        });

        userStrategies[msg.sender].push(strategyId);

        emit StrategyRegistered(strategyId, tokenId, msg.sender, name);

        return strategyId;
    }

    function submitComputeTask(
        uint256 strategyId,
        string calldata computeInput
    ) external onlyStrategyOwner(strategyId) onlyActiveStrategy(strategyId) returns (bytes32) {
        bytes32 taskId = keccak256(abi.encodePacked(
            strategyId,
            block.timestamp,
            msg.sender
        ));

        strategies[strategyId].lastComputed = block.timestamp;

        emit ComputeTaskSubmitted(strategyId, taskId);

        return taskId;
    }

    function verifyResult(
        uint256 strategyId,
        bytes32 daRoot,
        bytes32 computeProof,
        Performance calldata performance
    ) external nonReentrant {
        require(computeProof != bytes32(0), "Invalid proof");
        require(performance.tradesCount > 0, "No trades");

        verifications[strategyId] = Verification({
            daRoot: daRoot,
            computeProof: computeProof,
            verified: true,
            verifiedAt: block.timestamp
        });

        performances[strategyId] = performance;

        emit ResultVerified(strategyId, computeProof);
        emit PerformanceUpdated(strategyId, performance.totalReturn);

        if (address(ranking) != address(0)) {
            _syncRankings();
        }
    }

    function _syncRankings() internal {
        uint256 maxId = strategyCount > 256 ? 256 : strategyCount;
        uint256 count = 0;
        for (uint256 i = 1; i <= maxId; i++) {
            if (verifications[i].verified) {
                count++;
            }
        }
        if (count == 0) return;

        uint256[] memory ids = new uint256[](count);
        uint256[] memory returns_ = new uint256[](count);
        uint256[] memory sharpes = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= maxId; i++) {
            if (verifications[i].verified) {
                ids[idx] = i;
                returns_[idx] = performances[i].totalReturn;
                sharpes[idx] = performances[i].sharpeRatio;
                idx++;
            }
        }
        ranking.updateRankings(ids, returns_, sharpes);
    }

    function getStrategy(uint256 strategyId)
        external
        view
        returns (Strategy memory)
    {
        return strategies[strategyId];
    }

    function getPerformance(uint256 strategyId)
        external
        view
        returns (Performance memory)
    {
        return performances[strategyId];
    }

    function getVerification(uint256 strategyId)
        external
        view
        returns (Verification memory)
    {
        return verifications[strategyId];
    }

    function getUserStrategies(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userStrategies[user];
    }

    function setRanking(address _ranking) external onlyOwner {
        ranking = Ranking(_ranking);
    }

    function setRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
