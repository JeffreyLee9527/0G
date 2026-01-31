# Verifiable AI Trading Arena

0G 黑客松 MVP - 可验证的 AI 交易竞技场

## 演示版本（可直接运行）

```bash
cd frontend
npm install
npm run dev
```

访问 **http://localhost:5173**，连接 MetaMask 并切换到 0G Galileo 网络即可演示。

**合约已部署** 0G Galileo 测试网，`frontend/.env.local` 已配置。

## MVP 部署信息

- **合约**：0G Galileo (CHAIN_ID: 16602)，见 [deployment-addresses.txt](deployment-addresses.txt)
- **前端**：本地 `npm run dev` 或 `npm run preview`（生产构建后）
- **水龙头**：https://faucet.0g.ai/

## 技术栈

- **智能合约**: Foundry + Solidity ^0.8.20
- **前端**: React 18 + Vite + ethers.js 5
- **网络**: 0G Galileo Testnet (CHAIN_ID: 16602)

## 快速开始

### 1. 部署合约

```bash
# 配置 .env (PRIVATE_KEY, RPC_URL)
forge build
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast -vvvv
```

### 2. 配置前端

若重新部署合约，运行 `scripts/post-deploy.ps1` 或手动更新 `frontend/.env.local`：

```env
VITE_ARENA_CONTRACT=0x1A6A709672Cd8469e3760C6d5B2d4d60f7871493
VITE_STRATEGY_NFT_CONTRACT=0x8d0999A40C55e173c0aDC6F87ccC280cD861cBd8
VITE_RANKING_CONTRACT=0xD6f9724f7B56053230beB769157c7f06d8f1A654
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 4. 核心功能演示路径

1. 连接钱包（MetaMask）
2. 自动切换到 0G Galileo 网络
3. 注册策略（0.01 0G）
4. 提交计算任务（策略详情中点击「提交计算任务」）
5. 验证结果（策略详情中填写 daRoot、computeProof、性能数据后提交）
6. 查看排名（Arena 页自动展示按 performance 排序的排名）

**获取测试 0G**：访问 [水龙头](https://faucet.0g.ai/) 获取测试代币。

## 项目结构

```
├── src/           # Foundry 合约
│   ├── Arena.sol
│   ├── StrategyNFT.sol
│   ├── Ranking.sol
│   └── interfaces/
├── script/        # 部署脚本
├── test/          # Foundry 测试
└── frontend/      # React 前端
```

## 0G 生态结合点

- **DA 层存证**：策略代码/元数据通过 `daStorageUrl` 存证；`verifyResult` 的 `daRoot`、`computeProof` 对应 result_hash、logs_hash 存证点
- **Compute 验质**：当前 MVP 用 result_hash（computeProof）校验；后续可接入 0G Compute / TEE 可信执行
- **合约结算**：排名由合约 `Ranking.updateRankings` 自动更新，依据可验证的 performance 数据

## 水龙头

https://faucet.0g.ai/
