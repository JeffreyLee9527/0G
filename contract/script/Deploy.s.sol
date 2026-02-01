// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/StrategyNFT.sol";
import "../src/Arena.sol";
import "../src/Ranking.sol";

contract DeployScript is Script {
    StrategyNFT public strategyNFT;
    Arena public arena;
    Ranking public ranking;

    function run() external {
        // 使用 CLI --private-key，支持带或不带 0x 前缀
        vm.startBroadcast();

        // 1. 部署 StrategyNFT
        console.log("Deploying StrategyNFT...");
        strategyNFT = new StrategyNFT();
        console.log("StrategyNFT deployed to:", address(strategyNFT));

        // 2. 部署 Arena
        console.log("Deploying Arena...");
        arena = new Arena(address(strategyNFT));
        console.log("Arena deployed to:", address(arena));

        // 3. 部署 Ranking
        console.log("Deploying Ranking...");
        ranking = new Ranking(address(arena));
        console.log("Ranking deployed to:", address(ranking));

        // 4. 设置 StrategyNFT 的 minter 为 Arena
        console.log("Setting StrategyNFT minter to Arena...");
        strategyNFT.setMinter(address(arena));
        console.log("Minter set successfully");

        // 5. 设置 Arena 的 ranking 为 Ranking 合约
        console.log("Setting Arena ranking to Ranking...");
        arena.setRanking(address(ranking));
        console.log("Ranking set successfully");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("StrategyNFT:", address(strategyNFT));
        console.log("Arena:", address(arena));
        console.log("Ranking:", address(ranking));
    }
}
