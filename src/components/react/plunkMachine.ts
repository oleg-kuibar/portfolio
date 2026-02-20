// Pure state logic for the PlunkPlayground — zero React imports

export type Phase = 'idle' | 'publishing' | 'injecting' | 'pushing' | 'dev' | 'restoring';
export type LineType = 'cmd' | 'success' | 'info' | 'error' | 'warn' | 'dim' | 'file' | 'hash' | 'accent';

export interface TerminalLine {
  id: number;
  html: string;
  type: LineType;
}

export interface PlunkConfig {
  packageName: string;
  version: string;
  filesCount: number;
  pm: 'pnpm' | 'npm' | 'yarn' | 'bun';
  speed: 'fast' | 'normal' | 'slow';
  changeOnRepublish: boolean;
}

export interface ArchState {
  libraryActive: boolean;
  storeActive: boolean;
  consumerActive: boolean;
  publishArrow: boolean;
  injectArrow: boolean;
  storeFiles: string[] | null;
  consumerFiles: string[] | null;
}

export interface Stats {
  published: number;
  injected: number;
  filesCopied: number;
  skipped: number;
}

export const DEFAULT_CONFIG: PlunkConfig = {
  packageName: '@acme/ui-kit',
  version: '2.4.0',
  filesCount: 4,
  pm: 'pnpm',
  speed: 'normal',
  changeOnRepublish: true,
};

export function getSpeedMultiplier(speed: PlunkConfig['speed']): number {
  return speed === 'fast' ? 0.5 : speed === 'slow' ? 2 : 1;
}

export function getIntervalMs(speed: PlunkConfig['speed']): number {
  return speed === 'fast' ? 40 : speed === 'slow' ? 160 : 80;
}

function randomHash(len = 16): string {
  const chars = '0123456789abcdef';
  let h = '';
  for (let i = 0; i < len; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

function line(type: LineType, html: string): TerminalLine {
  return { id: Math.random(), html, type };
}

export function generatePublishLines(config: PlunkConfig, isRepublish: boolean, prevHash: string | null): { lines: TerminalLine[]; hash: string; skipped: boolean } {
  const { packageName, version, filesCount, changeOnRepublish } = config;
  const shouldChange = !isRepublish || changeOnRepublish;
  const hash = shouldChange ? randomHash(16) : (prevHash || randomHash(16));

  const lines: TerminalLine[] = [
    line('cmd', `$ plunk publish`),
    line('info', `Reading package.json...`),
    line('info', `Resolving ${filesCount} publishable files for ${packageName}@${version}`),
    line('hash', `Computing content hash... ${hash}`),
  ];

  if (!shouldChange && prevHash) {
    lines.push(
      line('info', `${packageName}@${version} already up to date`),
      line('dim', `Skipped — hash unchanged`),
    );
    return { lines, hash, skipped: true };
  }

  lines.push(line('info', `Copying files to store...`));
  for (let i = 1; i <= Math.min(filesCount, 6); i++) {
    lines.push(line('file', `  + dist/file${i}.mjs (CoW copy)`));
  }
  if (filesCount > 6) {
    lines.push(line('dim', `  ... and ${filesCount - 6} more`));
  }
  lines.push(
    line('info', `Writing .plunk-meta.json`),
    line('success', `✓ Published ${packageName}@${version} (${filesCount} files)`),
  );

  return { lines, hash, skipped: false };
}

export function generateInjectLines(config: PlunkConfig): TerminalLine[] {
  const { packageName, version, pm, filesCount } = config;
  const lines: TerminalLine[] = [
    line('cmd', `$ plunk add ${packageName}`),
    line('info', `Package manager: ${pm}`),
    line('info', `Backing up existing ${packageName} in node_modules...`),
  ];

  if (pm === 'pnpm') {
    lines.push(line('info', `pnpm: resolving symlink into .pnpm/ virtual store`));
  }

  lines.push(
    line('info', `Incremental copy: ${filesCount} copied, 0 removed, 0 skipped`),
    line('info', `Creating bin links...`),
    line('info', `Invalidating bundler cache...`),
    line('success', `✓ Injected ${packageName}@${version} into ~/my-app/`),
  );

  return lines;
}

export function generatePushLines(config: PlunkConfig, isRepublish: boolean, prevHash: string | null): { lines: TerminalLine[]; hash: string; skipped: boolean } {
  const { lines: pubLines, hash, skipped } = generatePublishLines(config, isRepublish, prevHash);
  const lines: TerminalLine[] = [
    line('cmd', `$ plunk push`),
    line('dim', `— publish + inject all consumers —`),
    ...pubLines.slice(1), // skip the `$ plunk publish` cmd line
  ];

  if (!skipped) {
    const injLines = generateInjectLines(config);
    lines.push(...injLines.slice(1)); // skip the `$ plunk add` cmd line
  }

  return { lines, hash, skipped };
}

export function generateDevLines(config: PlunkConfig): TerminalLine[] {
  return [
    line('cmd', `$ plunk dev`),
    line('info', `Watching src/ for changes...`),
    line('info', `Build cmd: tsup`),
    line('dim', `Press the button again to stop.`),
  ];
}

export function generateRestoreLines(config: PlunkConfig): TerminalLine[] {
  const { packageName } = config;
  return [
    line('cmd', `$ plunk restore ${packageName}`),
    line('info', `Restoring backup of ${packageName}...`),
    line('info', `Removing bin links...`),
    line('success', `✓ Restored ${packageName} to original version`),
  ];
}

export function generateSimpleCommandLines(cmd: string, config: PlunkConfig, state: { published: boolean; injected: boolean; hash: string | null }): TerminalLine[] {
  const { packageName, version, filesCount, pm } = config;

  switch (cmd) {
    case 'init':
      return [
        line('cmd', `$ plunk init`),
        line('info', `Creating .plunk/state.json...`),
        line('success', `✓ Initialized plunk in ~/my-app/`),
      ];
    case 'remove':
      return [
        line('cmd', `$ plunk remove ${packageName}`),
        line('info', `Removing injected package and bin links...`),
        line('success', `✓ Removed ${packageName}`),
      ];
    case 'status':
      if (state.injected) {
        return [
          line('cmd', `$ plunk status`),
          line('accent', `${packageName} @${version} ${state.hash || '???'}`),
          line('dim', `  linked at: ${new Date().toISOString()}`),
          line('dim', `  pm: ${pm}`),
        ];
      }
      return [
        line('cmd', `$ plunk status`),
        line('dim', `No linked packages.`),
      ];
    case 'list':
      if (state.published) {
        return [
          line('cmd', `$ plunk list`),
          line('accent', `${packageName}@${version}`),
          line('hash', `  hash: ${state.hash || '???'}`),
          line('dim', `  ${filesCount} files`),
        ];
      }
      return [
        line('cmd', `$ plunk list`),
        line('dim', `Store is empty.`),
      ];
    case 'update':
      if (state.published && state.injected) {
        return [
          line('cmd', `$ plunk update`),
          line('info', `Re-injecting latest from store...`),
          line('success', `✓ Updated ${packageName}`),
        ];
      }
      return [
        line('cmd', `$ plunk update`),
        line('dim', `Nothing to update.`),
      ];
    case 'clean':
      return [
        line('cmd', `$ plunk clean`),
        line('info', `Scanning store for orphaned entries...`),
        line('success', `✓ Store is clean. 0 entries removed.`),
      ];
    case 'doctor':
      return [
        line('cmd', `$ plunk doctor`),
        line('info', `Checking plunk health...`),
        line('success', `✓ Store directory exists`),
        line('success', `✓ consumers.json is valid`),
        ...(state.injected
          ? [line('success', `✓ ${packageName} hash matches store`)]
          : [line('dim', `  No linked packages to verify`)]),
        line('success', `✓ All checks passed`),
      ];
    default:
      return [line('dim', `Unknown command: ${cmd}`)];
  }
}

export function computeArchState(phase: Phase, progress: number, published: boolean, injected: boolean): ArchState {
  const base: ArchState = {
    libraryActive: false,
    storeActive: published,
    consumerActive: injected,
    publishArrow: false,
    injectArrow: false,
    storeFiles: null,
    consumerFiles: null,
  };

  if (phase === 'publishing' || phase === 'pushing') {
    if (progress < 0.5) {
      return { ...base, libraryActive: true, publishArrow: true };
    }
    if (progress < 0.85) {
      return { ...base, libraryActive: true, storeActive: true, publishArrow: true };
    }
    if (phase === 'pushing' && progress >= 0.85) {
      return { ...base, storeActive: true, consumerActive: true, injectArrow: true };
    }
    return { ...base, storeActive: true };
  }

  if (phase === 'injecting') {
    if (progress < 0.5) {
      return { ...base, storeActive: true, injectArrow: true };
    }
    return { ...base, storeActive: true, consumerActive: true, injectArrow: true };
  }

  if (phase === 'restoring') {
    return { ...base, consumerActive: true };
  }

  return base;
}

export interface CommandDef {
  cmd: string;
  description: string;
}

export const COMMANDS: CommandDef[] = [
  { cmd: 'init', description: 'Initialize plunk in a project' },
  { cmd: 'publish', description: 'Copy built files to store' },
  { cmd: 'add', description: 'Link a package from store' },
  { cmd: 'remove', description: 'Unlink a package' },
  { cmd: 'push', description: 'Publish + inject all consumers' },
  { cmd: 'dev', description: 'Watch & auto-push on change' },
  { cmd: 'restore', description: 'Restore original from backup' },
  { cmd: 'status', description: 'Show linked packages' },
  { cmd: 'list', description: 'List store contents' },
  { cmd: 'update', description: 'Re-inject latest from store' },
  { cmd: 'clean', description: 'Garbage-collect the store' },
  { cmd: 'doctor', description: 'Diagnose issues' },
];

export interface ComparisonRow {
  feature: string;
  plunk: { text: string; status: 'yes' | 'no' | 'partial' };
  npmLink: { text: string; status: 'yes' | 'no' | 'partial' };
  yalc: { text: string; status: 'yes' | 'no' | 'partial' };
  pnpmLink: { text: string; status: 'yes' | 'no' | 'partial' };
}

export const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Strategy',
    plunk: { text: 'file copy', status: 'yes' },
    npmLink: { text: 'symlink', status: 'no' },
    yalc: { text: 'file copy', status: 'yes' },
    pnpmLink: { text: 'symlink', status: 'no' },
  },
  {
    feature: 'No git contamination',
    plunk: { text: '✓', status: 'yes' },
    npmLink: { text: '✓', status: 'yes' },
    yalc: { text: '✗ .yalc/', status: 'no' },
    pnpmLink: { text: '✓', status: 'yes' },
  },
  {
    feature: 'Incremental copy',
    plunk: { text: '✓ hash-based', status: 'yes' },
    npmLink: { text: 'n/a', status: 'no' },
    yalc: { text: '✗ full copy', status: 'no' },
    pnpmLink: { text: 'n/a', status: 'no' },
  },
  {
    feature: 'CoW (copy-on-write)',
    plunk: { text: '✓', status: 'yes' },
    npmLink: { text: '✗', status: 'no' },
    yalc: { text: '✗', status: 'no' },
    pnpmLink: { text: '✗', status: 'no' },
  },
  {
    feature: 'pnpm virtual store aware',
    plunk: { text: '✓', status: 'yes' },
    npmLink: { text: '✗', status: 'no' },
    yalc: { text: 'partial', status: 'partial' },
    pnpmLink: { text: '✓', status: 'yes' },
  },
  {
    feature: 'HMR / Vite integration',
    plunk: { text: '✓ plugin', status: 'yes' },
    npmLink: { text: '✗', status: 'no' },
    yalc: { text: '✗', status: 'no' },
    pnpmLink: { text: 'manual', status: 'partial' },
  },
  {
    feature: 'workspace:* rewriting',
    plunk: { text: '✓', status: 'yes' },
    npmLink: { text: '✗', status: 'no' },
    yalc: { text: '✗', status: 'no' },
    pnpmLink: { text: '✗', status: 'no' },
  },
  {
    feature: 'Watch mode',
    plunk: { text: '✓', status: 'yes' },
    npmLink: { text: '✗', status: 'no' },
    yalc: { text: 'yalc push --watch', status: 'partial' },
    pnpmLink: { text: '✗', status: 'no' },
  },
];
