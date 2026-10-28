<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/tickets-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const WHAT: Record<Problem, string> = {
    parser: 'the shared parser reads a day-first date month first',
    hint: 'booking-v3 prints MM/DD/YYYY under the date; people type that and the form reads it day first',
    'day-move': 'the date lands one day off, or on a different day per time zone',
    unplaced: 'no tenant on file: the desk cannot place these yet',
  };

  const all = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const exported = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const groups = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const issues = tickets.issues as Record<string, number>;
  const link = (p: Problem) => (issues[p] ? `https://github.com/${tickets.repo}/issues/${issues[p]}` : null);
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{all.length}</strong> reports in #{ticket} ({exported} rows in the export, {exported - all.length} of them repeats) ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>what goes wrong</th><th>tenants</th><th>channels</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const href = link(g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{WHAT[g.problem]}</td>
        <td>{g.tenants}</td>
        <td class="muted">{channels(g.channels)}</td>
        <td class="muted">{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if href}<a {href}>#{issues[g.problem]}</a>{:else}<span class="none">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
