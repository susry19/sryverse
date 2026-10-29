/* Ana iş parçacığından motora ince istemci (sözleşme: runtime.py). */
export function createEngine() {
  const w = new Worker(new URL('./engine.worker.js', import.meta.url), { type: 'module' })
  let seq = 0
  const wait = new Map()
  w.onmessage = ({ data }) => {
    const p = wait.get(data.id); if (!p) return
    wait.delete(data.id)
    data.ok ? p.res(data.out) : p.rej(new Error(data.error))
  }
  w.onerror = (e) => { wait.forEach((p) => p.rej(new Error(e.message || 'Motor yüklenemedi'))); wait.clear() }
  const call = (op, arg) => new Promise((res, rej) => { const id = ++seq; wait.set(id, { res, rej }); w.postMessage({ id, op, arg }) })
  return {
    boot: () => call('boot'),
    start: (ctx) => call('start', ctx),
    turn: (text) => call('turn', text),
    complete: (text) => call('complete', text),
    pause: () => call('pause'),
    human: () => call('human'),
    summary: () => call('summary'),
    dispose: () => w.terminate(),
  }
}
