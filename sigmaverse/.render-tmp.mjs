import { createServer } from 'vite'
import fs from 'node:fs'
const root = '/home/user/claude-design-lab/sigmaverse'
const here = new URL('.', import.meta.url).pathname
const server = await createServer({
  root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom',
  resolve: { alias: [{ find: /^motion\/react$/, replacement: here + 'shim.tsx' }] },
  plugins: [{ name: 'narrow', enforce: 'pre', transform(code, id) { if (id.includes('/diagrams/')) return code.replace("() => false)", "() => globalThis.__NARROW__)") } }],
})
const React = await server.ssrLoadModule('react')
const { renderToStaticMarkup } = await server.ssrLoadModule('react-dom/server')
const css = fs.readFileSync(root + '/src/styles/index.css', 'utf8')
const vars = Object.fromEntries([...css.split('.dark')[0].matchAll(/--([\w-]+):\s*(#[0-9a-f]+)/g)].map(m => [m[1], m[2]]))
const mods = { basics: ['sigmaCurve','timeline','dmaic','yfx','voices','roles'], fundamentals: ['processMap','ctqTree','iceberg','paretoDiagram','dpmoFlow'] }
const only = process.argv[2]
for (const [file, names] of Object.entries(mods)) {
  const m = await server.ssrLoadModule(`/src/diagrams/${file}.tsx`)
  for (const name of names) {
    if (only && !only.split(',').includes(name)) continue
    const v = m[name]
    for (const narrow of [false, true]) {
      globalThis.__NARROW__ = narrow
      const steps = process.argv[3] ? process.argv[3].split(',').map(Number) : v.steps.map((_, i) => i)
      for (const s of steps) {
        let svg = renderToStaticMarkup(React.createElement(v.View, { step: s }))
        svg = svg.replace(/var\(--font-[\w-]+\)/g, 'DejaVu Sans').replace(/var\(--([\w-]+)\)/g, (_, k) => vars[k] ?? '#f0f')
        svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" style="background:#fff" ')
        fs.writeFileSync(`${here}out/${name}-${narrow ? 'n' : 'w'}-${s}.svg`, svg)
      }
    }
  }
}
await server.close()
