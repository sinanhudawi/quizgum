import { cn } from '@/lib/utils'

type Row = {
  rank: number
  username: string
  score: number
  total: number
  percentage: number
  time: string
  isMe: boolean
}

export function Leaderboard({ rows }: { rows: Row[] }) {
  return (
    <section aria-labelledby="leaderboard-heading" className="qg-card overflow-hidden">
      <h2 id="leaderboard-heading" className="px-6 pt-5 pb-3 font-display text-2xl font-semibold text-secondary-foreground">
        Leaderboard
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-6 py-2">Rank</th>
              <th scope="col" className="px-2 py-2">Player</th>
              <th scope="col" className="px-2 py-2 text-right">Score</th>
              <th scope="col" className="px-2 py-2 text-right">%</th>
              <th scope="col" className="px-6 py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.rank}
                className={cn('border-t border-border', row.isMe && 'bg-accent/10 font-bold')}
              >
                <td className="px-6 py-3 font-display text-base font-semibold text-primary">#{row.rank}</td>
                <td className="px-2 py-3">
                  @{row.username}
                  {row.isMe && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">You</span>}
                </td>
                <td className="px-2 py-3 text-right">
                  {row.score}/{row.total}
                </td>
                <td className="px-2 py-3 text-right">{row.percentage}%</td>
                <td className="px-6 py-3 text-right text-muted-foreground">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
