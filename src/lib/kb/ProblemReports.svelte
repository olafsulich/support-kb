<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // Every report of one problem, in the reporter's words.
  let { ticket, problem }: { ticket: number; problem: Problem } = $props();

  const rows = $derived(
    groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove).find((g) => g.problem === problem)?.reports ?? [],
  );
</script>

<details>
  <summary>{rows.length} {problem} {rows.length === 1 ? 'report' : 'reports'}</summary>
  <table>
    <thead><tr><th>id</th><th>received</th><th>tenant</th><th>channel</th><th>report</th></tr></thead>
    <tbody>
      {#each rows as r (r.id)}
        <tr><td><code>{r.id}</code></td><td>{r.receivedAt.slice(0, 10)}</td><td>{r.tenant}</td><td>{r.channel}</td><td>{r.body}</td></tr>
      {/each}
    </tbody>
  </table>
</details>

<style>
  summary { cursor: pointer; color: var(--accent); }
  td:last-child { font-size: 0.9em; }
</style>
