export default function RankingList({ strategies, onStrategyClick }) {
  if (!strategies || strategies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No strategies registered yet. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-400 pb-2 border-b border-gray-700">
        <div className="col-span-1">Rank</div>
        <div className="col-span-2">Strategy</div>
        <div className="col-span-1">Return</div>
        <div className="col-span-1">Sharpe</div>
        <div className="col-span-1">Trades</div>
      </div>

      {strategies.map((strategy, index) => (
        <div
          key={strategy.id}
          onClick={() => onStrategyClick && onStrategyClick(strategy.id)}
          className="grid grid-cols-6 gap-4 p-3 hover:bg-gray-700 rounded cursor-pointer transition"
        >
          <div className="col-span-1 flex items-center">
            <span
              className={`text-lg font-bold ${
                index === 0
                  ? 'text-yellow-400'
                  : index === 1
                  ? 'text-gray-300'
                  : index === 2
                  ? 'text-orange-400'
                  : 'text-gray-500'
              }`}
            >
              #{index + 1}
            </span>
          </div>

          <div className="col-span-2 flex items-center">
            <div>
              <div className="font-semibold">{strategy.name || 'Unnamed'}</div>
              <div className="text-sm text-gray-400">
                {strategy.owner
                  ? `${strategy.owner.slice(0, 6)}...${strategy.owner.slice(-4)}`
                  : '-'}
              </div>
            </div>
          </div>

          <div className="col-span-1 flex items-center">
            <span
              className={
                (strategy.totalReturn || 10000) >= 10000
                  ? 'text-green-400'
                  : 'text-red-400'
              }
            >
              {(((strategy.totalReturn || 10000) - 10000) / 100).toFixed(2)}%
            </span>
          </div>

          <div className="col-span-1 flex items-center">
            {((strategy.sharpeRatio || 0) / 10000).toFixed(2)}
          </div>

          <div className="col-span-1 flex items-center text-gray-400">
            {strategy.tradesCount ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}
