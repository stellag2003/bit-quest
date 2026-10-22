/**
 * Program nodes (plain data, serialisable):
 *   { id, type: 'cmd',      command }
 *   { id, type: 'repeat',   times, body: [cmd | call...] }
 *   { id, type: 'function', body: [cmd...] }   (Fase 5: at most one, defines the ★ block)
 *   { id, type: 'call' }                       (runs the function's body)
 *   { id, type: 'rule',     condition, action }
 */
let nodeCounter = 0;
export function nextNodeId() {
  nodeCounter += 1;
  return `n${nodeCounter}`;
}

export const REPEAT_LIMITS = Object.freeze({ min: 2, max: 9 });

export const cmd = (command) => ({ id: nextNodeId(), type: 'cmd', command });
export const repeat = (times, body = []) => ({ id: nextNodeId(), type: 'repeat', times, body });
export const rule = (condition = null, action = null) => ({ id: nextNodeId(), type: 'rule', condition, action });
export const fn = (body = []) => ({ id: nextNodeId(), type: 'function', body });
export const call = () => ({ id: nextNodeId(), type: 'call' });

const definitionIn = (nodes) => nodes.find((node) => node.type === 'function') ?? null;

/**
 * Blocks the child placed: a Repetir counts as one block plus its body; the
 * function's frame is free (it is always on screen) but its body counts.
 */
export function countBlocks(nodes) {
  return nodes.reduce((total, node) => {
    if (node.type === 'function') return total + countBlocks(node.body);
    return total + 1 + (node.type === 'repeat' ? countBlocks(node.body) : 0);
  }, 0);
}

/** How many commands the program would need without loops or functions. */
export function expandedLength(nodes, def = definitionIn(nodes)) {
  return nodes.reduce((total, node) => {
    if (node.type === 'function') return total;
    if (node.type === 'repeat') return total + node.times * expandedLength(node.body, def);
    if (node.type === 'call') return total + (def ? expandedLength(def.body, def) : 0);
    return total + 1;
  }, 0);
}

/**
 * Walks the program in execution order. `loops` tells which Repetir iteration
 * (and which ★ call) each command belongs to, so the editor can light them up.
 */
export function* flatten(nodes, loops = [], def = definitionIn(nodes)) {
  for (const node of nodes) {
    if (node.type === 'repeat') {
      for (let iteration = 1; iteration <= node.times; iteration += 1) {
        yield* flatten(node.body, [...loops, { id: node.id, iteration, times: node.times }], def);
      }
    } else if (node.type === 'call' && def) {
      yield* flatten(def.body, [...loops, { id: node.id, iteration: 1, times: 1, call: true }], def);
    } else if (node.type === 'cmd') {
      yield { node, loops };
    }
  }
}

export function findSequenceProblem(nodes, def = definitionIn(nodes)) {
  const main = nodes.filter((node) => node.type !== 'function');
  if (main.length === 0) return def?.body.length ? { code: 'function_not_called', nodeId: def.id } : { code: 'empty', nodeId: null };
  for (const node of main) {
    if (node.type === 'call' && !def?.body.length) return { code: 'empty_function', nodeId: def?.id ?? node.id };
    if (node.type !== 'repeat') continue;
    if (node.body.length === 0) return { code: 'empty_loop', nodeId: node.id };
    const inner = findSequenceProblem(node.body, def);
    if (inner) return inner;
  }
  return null;
}

export const isCompleteRule = (r) => Boolean(r.condition && r.action);

export function findRuleProblem(rules) {
  const partial = rules.find((r) => Boolean(r.condition) !== Boolean(r.action));
  if (partial) return { code: 'incomplete_rule', nodeId: partial.id };
  if (!rules.some(isCompleteRule)) return { code: 'incomplete_rule', nodeId: rules[0]?.id ?? null };
  return null;
}
