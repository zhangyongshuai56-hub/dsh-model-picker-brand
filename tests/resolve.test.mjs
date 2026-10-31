import fs from 'node:fs'
const src = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
let exportsObj=null
globalThis.window = { __ModuleLoader__: { load({factory}) { exportsObj = factory((n)=> n==='react' ? {createElement:()=>({}), useState:()=>[null,()=>{}]} : (()=>{throw new Error(n)})) } }, localStorage: { getItem:()=>null } }
globalThis.document = { head:{appendChild(){}}, getElementById:()=>null, createElement:()=>({setAttribute(){},set textContent(v){}}) }
new Function('window','document',src)(globalThis.window, globalThis.document)

const cases = [
  // 用户实际会遇到的
  ['zai', null, 'zhipu'], ['zhipu', null, 'zhipu'], ['zhipuai', null, 'zhipu'], ['glm', null, 'zhipu'],
  ['zcode', null, 'zhipu'], ['bigmodel', null, 'zhipu'], ['z-ai', null, 'zhipu'], ['Z.ai', null, 'zhipu'],
  ['our-free-model', null, 'opencode'], ['our-free-model-region', null, 'opencode'], ['opencode', null, 'opencode'],
  ['deepseek-official', null, 'deepseek'], ['deepseek-account', null, 'deepseek'],
  ['openai-account', null, 'openai'], ['azure-openai', null, 'openai'], ['anthropic-account', null, 'claude'],
  ['gemini', null, 'googlegemini'], ['vertex-ai', null, 'googlegemini'], ['kimi', null, 'kimi'], ['moonshotai', null, 'kimi'],
  ['minimax-code', null, 'minimax'], ['qwencloud', null, 'qwen'], ['dashscope', null, 'qwen'],
  ['bytedance', null, 'bytedance'], ['doubao', null, 'bytedance'], ['nvidia-nim', null, 'nvidia'],
  ['ollama', null, 'ollama'], ['lmstudio', null, 'ollama'], ['openrouter', null, 'openrouter'],
  ['mistralai', null, 'mistral'], ['cloudflare-workers-ai', null, 'cloudflare'], ['perplexity', null, 'perplexity'],
  // 只给名字（中文）
  [null, '智谱清言', 'zhipu', true], [null, '通义千问', 'qwen', true], [null, '月之暗面', 'kimi', true], [null, '阿里云', 'alibabacloud', true],
  // 只给模型名反推
  [null, null, 'zhipu', false, 'glm-4.6'], [null, null, 'claude', false, 'claude-3-7-sonnet'], [null, null, 'openai', false, 'gpt-4o'],
  [null, null, 'googlegemini', false, 'gemini-2.5-pro'], [null, null, 'deepseek', false, 'deepseek-v4.1-flash'],
  // 未知
  ['totally-unknown-provider', null, null],
]
let pass=0, fail=0
for (const [pid, pname, expect, byName, modelId] of cases) {
  const provider = { id: pid || 'unknown-p', name: pname || (pid || 'Unknown') }
  const model = modelId ? { id: modelId, name: modelId } : null
  const got = exportsObj.resolve(provider, model)
  const ok = got === expect
  if (ok) pass++; else { fail++; console.log('FAIL', JSON.stringify({pid,pname,modelId}), 'expect', expect, 'got', got) }
}
console.log(`RESOLVE ${pass}/${pass+fail} passed`)
// 覆盖表测试
globalThis.window.localStorage = { getItem:(k)=> k==='dsh.model-picker-brand.overrides' ? JSON.stringify({'weird-provider':'zhipu'}) : null }
console.log('override test =>', exportsObj.resolve({id:'weird-provider',name:'???'}, null), '(expect zhipu)')
