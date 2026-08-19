import { encodeEvent, decodeEvent, normalizeEvent } from '../app/composables/useEventCodec.ts'

const cases = [
  { t: '2026-08-20T15:19:00.000Z', title: 'SpaceX Launch', url: 'https://youtube.com/watch' },
  { t: '2026-08-20T15:19:00.000Z', title: 'SpaceX Launch' },
  { t: '2026-12-31T23:59:59.000Z', title: 'New Year 🎉', url: 'https://example.com' },
  { t: '2026-06-15T10:00:00.000Z', title: '日本語タイトル' },
  { t: '2026-01-01T00:00:00.000Z', title: 'a', url: 'https://x.com' },
]

let pass = 0
let fail = 0

console.log('=== Round-trip tests ===')
for (const original of cases) {
  const encoded = encodeEvent(original)
  const decoded = decodeEvent(encoded)
  const ok = decoded && JSON.stringify(decoded) === JSON.stringify(original)
  if (ok) {
    pass++
  } else {
    fail++
  }
  console.log(`${ok ? '✓' : '✗'} ${original.title}`)
  console.log(`  encoded: ${encoded}`)
  console.log(`  decoded: ${JSON.stringify(decoded)}`)
}

console.log('\n=== Malformed input tests ===')
const malformed = [null, undefined, '', 'not-base64!!!', 'eyJ0IjoiYmFkIn0', 'e30', 'abc']
for (const bad of malformed) {
  const decoded = decodeEvent(bad)
  const ok = decoded === null
  if (ok) {
    pass++
  } else {
    fail++
  }
  console.log(`${ok ? '✓' : '✗'} decodeEvent(${JSON.stringify(bad)}) => ${decoded}`)
}

console.log('\n=== normalizeEvent tests ===')
const normCases = [
  { input: { t: '2026-08-20T15:19:00.000Z', title: 'OK' }, shouldPass: true },
  { input: { t: 'not-a-date', title: 'bad' }, shouldPass: false },
  { input: { t: '2026-08-20T15:19:00.000Z' }, shouldPass: false },
  { input: { title: 'no-t' }, shouldPass: false },
  { input: null, shouldPass: false },
  {
    input: { t: '2026-08-20T15:19:00.000Z', title: '  trim  ', url: '  ' },
    shouldPass: true,
    expectUrl: false,
  },
  {
    input: { t: '2026-08-20T15:19:00.000Z', title: 'x', url: 'https://ok.com' },
    shouldPass: true,
    expectUrl: true,
  },
]
for (const { input, shouldPass, expectUrl } of normCases) {
  const result = normalizeEvent(input)
  const ok = shouldPass ? result !== null : result === null
  if (ok) {
    pass++
  } else {
    fail++
  }
  console.log(`${ok ? '✓' : '✗'} normalize(${JSON.stringify(input)}) => ${JSON.stringify(result)}`)
  if (expectUrl && result?.url === undefined) {
    console.log(`  ✗ expected url to be present`)
    fail++
  }
}

console.log(`\n=== Results: ${pass} passed, ${fail} failed ===`)
process.exit(fail > 0 ? 1 : 0)
