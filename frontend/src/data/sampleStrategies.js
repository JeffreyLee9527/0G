// 演示用示例策略 - 用于预注册或展示
export const SAMPLE_STRATEGIES = [
  {
    name: 'Momentum Trader v1',
    description: 'Uses momentum indicators for trend following',
    code: `def strategy(data):
    if data['momentum'] > threshold:
        return 'BUY'
    elif data['momentum'] < -threshold:
        return 'SELL'
    else:
        return 'HOLD'`,
  },
  {
    name: 'Mean Reversion Bot',
    description: 'Statistical arbitrage using mean reversion',
    code: `def strategy(data):
    z_score = (data['price'] - mean) / std
    if z_score > 2:
        return 'SELL'
    elif z_score < -2:
        return 'BUY'
    else:
        return 'HOLD'`,
  },
];
