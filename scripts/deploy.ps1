# 加载 .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $val, 'Process')
    }
}

$pk = $env:PRIVATE_KEY
if ($pk -and -not $pk.StartsWith("0x")) { $pk = "0x" + $pk }

# 0G Galileo 需 >=2 gwei，略高以确保确认
$gasPrice = "3000000000"
forge script script/Deploy.s.sol:DeployScript `
  --rpc-url $env:RPC_URL `
  --private-key $pk `
  --broadcast `
  --legacy `
  --with-gas-price $gasPrice `
  -vvvv
