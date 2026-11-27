import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Exercise the actual label decorator and SVG markup rather than parsing source literals.
const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
let plugin
const window = {
  localStorage: { getItem: () => null },
  __ModuleLoader__: {
    load({ factory }) {
      plugin = factory((name) => {
        assert.equal(name, 'react')
        return { createElement: (type, props, ...children) => ({ type, props, children }) }
      })
    },
  },
}
const document = {
  getElementById: () => null,
  createElement: () => ({ setAttribute() {} }),
  head: { appendChild() {} },
}
new Function('window', 'document', source)(window, document)
let label
plugin.apply({ slots: {
  inject(name, callback) {
    assert.equal(name, 'conversation.input.model.label')
    callback()
  },
  register(options, component) {
    assert.equal(options.name, 'conversation.input.model.label')
    label = component
  },
} })
assert.equal(typeof label, 'function')

for (const { provider, model, paths } of [
  { provider: { id: 'unknown' }, model: { id: 'gpt-6-luna', name: 'GPT-6 Luna' }, paths: 1 },
  { provider: { id: 'ollama' }, model: { id: 'local-model', name: 'Local model' }, paths: 5 },
]) {
  for (const placement of ['trigger', 'menu', 'option']) {
    const logo = label({ provider, model, placement }).children[0]
    assert.equal(logo.props.className, 'dshmpb-logo')
    const svg = logo.props.dangerouslySetInnerHTML.__html
    const pathTags = svg.match(/<path\b[^>]*>/g) || []
    assert.equal(pathTags.length, paths, `${model.id}: expected logo paths`)
    for (const path of pathTags) {
      assert.match(path, /\bfill="currentColor"/, `${model.id}: path must follow the theme`)
    }
  }
}
console.log('Logo theme: OpenAI and Ollama follow currentColor in all placements')
