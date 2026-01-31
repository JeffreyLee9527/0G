# 从 broadcast JSON 解析合约地址，生成 frontend/.env.local
$broadcastPath = "broadcast/Deploy.s.sol/16602/run-latest.json"
if (-not (Test-Path $broadcastPath)) {
    Write-Error "Broadcast file not found: $broadcastPath"
    exit 1
}

$json = Get-Content $broadcastPath -Raw | ConvertFrom-Json
$arena = ""
$strategyNFT = ""
$ranking = ""

foreach ($tx in $json.transactions) {
    switch ($tx.contractName) {
        "Arena" { $arena = $tx.contractAddress }
        "StrategyNFT" { $strategyNFT = $tx.contractAddress }
        "Ranking" { $ranking = $tx.contractAddress }
    }
}

if (-not $arena -or -not $strategyNFT -or -not $ranking) {
    Write-Error "Could not find all contract addresses in broadcast file"
    exit 1
}

$envContent = @"
# 0G Galileo Testnet (由 post-deploy.ps1 自动生成)
VITE_0G_CHAIN_ID=16602
VITE_0G_RPC_URL=https://evmrpc-testnet.0g.ai

VITE_ARENA_CONTRACT=$arena
VITE_STRATEGY_NFT_CONTRACT=$strategyNFT
VITE_RANKING_CONTRACT=$ranking
"@

$outPath = "frontend/.env.local"
$envContent | Set-Content -Path $outPath -Encoding utf8
Write-Host "Generated $outPath"
