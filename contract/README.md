# Contract - 智能合约子工程

Verifiable AI Trading Arena 智能合约，基于 Foundry 构建。

## 目录结构

```
contract/
├── src/              # Solidity 合约源码
│   ├── Arena.sol
│   ├── StrategyNFT.sol
│   ├── Ranking.sol
│   └── interfaces/
├── script/           # 部署脚本
├── test/             # Foundry 测试
├── lib/              # 依赖 (forge-std, openzeppelin-contracts)
├── broadcast/        # 部署记录
└── foundry.toml
```

## 快速开始

```bash
# 安装依赖
npm install

# 编译
forge build

# 测试
forge test

# 部署 (需配置 .env: PRIVATE_KEY, RPC_URL)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $env:RPC_URL \
  --private-key $env:PRIVATE_KEY \
  --broadcast -vvvv
```

## 与前端 ABI 同步

合约编译后，可将 `out/` 下的 ABI 复制到 `../frontend/src/contracts/` 供前端使用。
