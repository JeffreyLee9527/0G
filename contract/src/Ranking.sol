// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Ranking
 * @notice 排名合约 - 基于性能数据计算排名
 * @dev 仅 Arena 合约可更新排名
 */
contract Ranking is Ownable {
    struct RankedStrategy {
        uint256 strategyId;
        uint256 score;
        uint256 totalReturn;
        uint256 sharpeRatio;
        uint256 lastUpdated;
    }

    address public arena;
    RankedStrategy[] public rankings;
    mapping(uint256 => uint256) public strategyToIndex;

    event RankingUpdated(uint256[] topStrategies);

    constructor(address _arena) Ownable(msg.sender) {
        arena = _arena;
    }

    modifier onlyArena() {
        require(msg.sender == arena, "Only arena can update");
        _;
    }

    function updateRankings(
        uint256[] calldata strategyIds,
        uint256[] calldata totalReturns,
        uint256[] calldata sharpeRatios
    ) external onlyArena {
        require(
            strategyIds.length == totalReturns.length &&
            strategyIds.length == sharpeRatios.length,
            "Array length mismatch"
        );

        delete rankings;

        for (uint256 i = 0; i < strategyIds.length; i++) {
            uint256 score = (totalReturns[i] * 70 + sharpeRatios[i] * 30) / 100;

            rankings.push(RankedStrategy({
                strategyId: strategyIds[i],
                score: score,
                totalReturn: totalReturns[i],
                sharpeRatio: sharpeRatios[i],
                lastUpdated: block.timestamp
            }));

            strategyToIndex[strategyIds[i]] = i;
        }

        _sortRankings();

        for (uint256 i = 0; i < rankings.length; i++) {
            strategyToIndex[rankings[i].strategyId] = i;
        }

        emit RankingUpdated(_getTopStrategyIds(10));
    }

    function getTopStrategies(uint256 n)
        external
        view
        returns (RankedStrategy[] memory)
    {
        uint256 length = n > rankings.length ? rankings.length : n;
        RankedStrategy[] memory top = new RankedStrategy[](length);

        for (uint256 i = 0; i < length; i++) {
            top[i] = rankings[i];
        }

        return top;
    }

    function getRank(uint256 strategyId)
        external
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < rankings.length; i++) {
            if (rankings[i].strategyId == strategyId) {
                return i + 1;
            }
        }
        return 0;
    }

    function getTotalCount() external view returns (uint256) {
        return rankings.length;
    }

    function _sortRankings() internal {
        for (uint256 i = 0; i < rankings.length; i++) {
            for (uint256 j = 0; j < rankings.length - i - 1; j++) {
                if (rankings[j].score < rankings[j + 1].score) {
                    RankedStrategy memory temp = rankings[j];
                    rankings[j] = rankings[j + 1];
                    rankings[j + 1] = temp;
                }
            }
        }
    }

    function _getTopStrategyIds(uint256 n)
        internal
        view
        returns (uint256[] memory)
    {
        uint256 length = n > rankings.length ? rankings.length : n;
        uint256[] memory ids = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            ids[i] = rankings[i].strategyId;
        }

        return ids;
    }
}
