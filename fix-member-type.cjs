const fs = require('fs');

let api = fs.readFileSync('src/lib/api.ts', 'utf8');
api = api.replace(
  'export type Member = { id: string; team_id: string; name: string; age: number };',
  'export type Member = { id: string; team_id: string; name: string; age: number; user_id: string | null };'
);
fs.writeFileSync('src/lib/api.ts', api);
console.log('done');
