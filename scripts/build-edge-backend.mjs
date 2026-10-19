import { spawnSync } from 'node:child_process';
// Bundle the tested services and source parser, excluding the Nest HTTP container.
const args = [
  '--yes',
  '--package=esbuild@0.25.12',
  'esbuild',
  'apps/api/src/edge/backend.ts',
  '--bundle',
  '--platform=node',
  '--format=esm',
  '--target=es2022',
  '--outfile=supabase/functions/_shared/backend.js',
  '--alias:@nestjs/common=./apps/api/src/edge/nest-runtime.ts',
  '--alias:@nestjs/schedule=./apps/api/src/edge/nest-runtime.ts',
  '--alias:@lastly/contracts=./packages/contracts/src/index.ts',
  '--alias:@lastly/parser=./packages/parser/src/index.ts',
  '--tsconfig=apps/api/tsconfig.json',
];
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
