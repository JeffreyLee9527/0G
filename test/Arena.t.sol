// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Arena.sol";
import "../src/StrategyNFT.sol";
import "../src/Ranking.sol";

contract ArenaTest is Test {
    Arena public arena;
    StrategyNFT public strategyNFT;
    Ranking public ranking;

    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        vm.startPrank(owner);
        strategyNFT = new StrategyNFT();
        arena = new Arena(address(strategyNFT));
        ranking = new Ranking(address(arena));
        arena.setRanking(address(ranking));
        strategyNFT.setMinter(address(arena));
        vm.stopPrank();

        vm.deal(user, 10 ether);
    }

    function test_RegisterStrategy() public {
        vm.startPrank(user);

        bytes32 codeHash = keccak256("strategy_code");
        string memory daUrl = "https://og-da.0g.ai/abc123";

        uint256 strategyId = arena.registerStrategy{value: 0.01 ether}(
            "Test Strategy",
            "A test strategy",
            codeHash,
            daUrl
        );

        assertEq(strategyId, 1);
        assertEq(strategyNFT.ownerOf(0), user);

        Arena.Strategy memory s = arena.getStrategy(1);
        assertEq(s.name, "Test Strategy");
        assertEq(s.owner, user);

        vm.stopPrank();
    }

    function test_RevertWhen_InsufficientFee() public {
        vm.startPrank(user);

        bytes32 codeHash = keccak256("strategy_code");
        string memory daUrl = "https://og-da.0g.ai/abc123";

        vm.expectRevert("Insufficient fee");
        arena.registerStrategy{value: 0.005 ether}(
            "Test Strategy",
            "A test strategy",
            codeHash,
            daUrl
        );

        vm.stopPrank();
    }

    function test_RevertWhen_EmptyName() public {
        vm.startPrank(user);

        bytes32 codeHash = keccak256("strategy_code");
        string memory daUrl = "https://og-da.0g.ai/abc123";

        vm.expectRevert("Name required");
        arena.registerStrategy{value: 0.01 ether}(
            "",
            "A test strategy",
            codeHash,
            daUrl
        );

        vm.stopPrank();
    }

    function test_RevertWhen_InvalidCodeHash() public {
        vm.startPrank(user);

        string memory daUrl = "https://og-da.0g.ai/abc123";

        vm.expectRevert("Invalid code hash");
        arena.registerStrategy{value: 0.01 ether}(
            "Test Strategy",
            "A test strategy",
            bytes32(0),
            daUrl
        );

        vm.stopPrank();
    }

    function test_SubmitComputeTask() public {
        vm.startPrank(user);

        bytes32 codeHash = keccak256("strategy_code");
        string memory daUrl = "https://og-da.0g.ai/abc123";

        arena.registerStrategy{value: 0.01 ether}(
            "Test Strategy",
            "A test strategy",
            codeHash,
            daUrl
        );

        bytes32 taskId = arena.submitComputeTask(1, "{}");
        assertTrue(taskId != bytes32(0));

        vm.stopPrank();
    }

    function test_RevertWhen_NotStrategyOwner_SubmitComputeTask() public {
        vm.startPrank(user);

        bytes32 codeHash = keccak256("strategy_code");
        string memory daUrl = "https://og-da.0g.ai/abc123";

        arena.registerStrategy{value: 0.01 ether}(
            "Test Strategy",
            "A test strategy",
            codeHash,
            daUrl
        );

        vm.stopPrank();
        vm.startPrank(address(0x3)); // different user

        vm.expectRevert("Not strategy owner");
        arena.submitComputeTask(1, "{}");

        vm.stopPrank();
    }

    function test_VerifyResult_UpdatesRanking() public {
        vm.startPrank(user);

        bytes32 codeHash = keccak256("strategy_code");
        string memory daUrl = "https://og-da.0g.ai/abc123";

        arena.registerStrategy{value: 0.01 ether}(
            "Test Strategy",
            "A test strategy",
            codeHash,
            daUrl
        );

        Arena.Performance memory perf = Arena.Performance({
            totalReturn: 10500,  // +5%
            sharpeRatio: 150,    // 1.5
            maxDrawdown: 200,    // 2%
            winRate: 6000,       // 60%
            tradesCount: 10,
            lastUpdated: block.timestamp
        });

        arena.verifyResult(
            1,
            keccak256("daRoot"),
            keccak256("computeProof"),
            perf
        );

        vm.stopPrank();

        // Ranking should be updated after verifyResult
        Ranking.RankedStrategy[] memory top = ranking.getTopStrategies(1);
        assertEq(top.length, 1);
        assertEq(top[0].strategyId, 1);
        assertEq(top[0].totalReturn, 10500);
        assertEq(top[0].sharpeRatio, 150);
        assertEq(ranking.getRank(1), 1);
    }
}
