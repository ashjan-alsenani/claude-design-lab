// Prints the SHA-256 value to put in OWNER_PASSWORD_SHA256. The app compares it with the trimmed password the owner types.
// Usage: npm run hash-password            (prompts, input hidden)
//        printf '%s' 'the password' | npm run -s hash-password
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';

const done = pw => {
  pw = String(pw || '').trim();
  if (pw.length < 12) { console.error('Use at least 12 characters.'); process.exit(1); }
  console.log(createHash('sha256').update(pw, 'utf8').digest('hex'));
};

if (!process.stdin.isTTY) {
  let data = ''; process.stdin.on('data', d => data += d); process.stdin.on('end', () => done(data));
} else {
  const rl = createInterface({input: process.stdin, output: process.stdout, terminal: true});
  process.stdout.write('Owner password (not shown): ');
  rl._writeToOutput = () => {};
  rl.question('', pw => { rl.close(); process.stdout.write('\n'); done(pw); });
}
