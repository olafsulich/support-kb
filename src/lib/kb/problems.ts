// What #4471 holds, one problem at a time, by what the reports describe. A day-first tenant's date
// comes out with day and month swapped, whichever way in (causes.ts splits `parser` from `hint`, but
// the reports show one swap). The desk's own notes (desk-notes.json) mark reports that read as a
// one-day move: no swap, a different problem. Counted the desk's way: a noted report stays counted
// where it is filed, and counts again under `day-move`.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'swap' | 'day-move' | 'unplaced';

export function problemsOf(r: Report, t: Tenant | undefined, dayMoves: readonly string[]): Problem[] {
  const filed: Problem = causeOf(r, t) === null ? 'unplaced' : 'swap';
  return dayMoves.includes(r.id) ? [filed, 'day-move'] : [filed];
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  dayMoves: readonly string[],
): ProblemGroup[] {
  const byProblem = new Map<Problem, Report[]>();
  for (const r of uniqueById(reports).filter((r) => r.mergedInto === ticket)) {
    for (const p of problemsOf(r, tenantOf(r), dayMoves)) byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
