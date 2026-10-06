/**
 * Program nodes (plain data, serialisable):
 *   { id, type: 'cmd',    command }
 *   { id, type: 'repeat', times, body: [cmd...] }
 *   { id, type: 'rule',   condition, action }
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

/** Blocks the child placed (a Repetir counts as one block, plus its body). */
export function countBlocks(nodes) {
  return nodes.reduce((total, node) => total + 1 + (node.type === 'repeat' ? countBlocks(node.body) : 0), 0);
}

/** How many commands the program would need without loops. */
export function expandedLength(nodes) {
  return nodes.reduce((total, node) => total + (node.type === 'repeat' ? node.times * expandedLength(node.body) : 1), 0);
}

/** Walks the program in execution order, telling which loop iteration each command belongs to. */
export function* flatten(nodes, loops = []) {
  for (const node of nodes) {
    if (node.type === 'repeat') {
      for (let iteration = 1; iteration <= node.times; iteration += 1) {
        yield* flatten(node.body, [...loops, { id: node.id, iteration, times: node.times }]);
      }
    } else if (node.type === 'cmd') {
      yield { node, loops };
    }
  }
}

export function findSequenceProblem(nodes) {
  if (nodes.length === 0) return { code: 'empty', nodeId: null };
  for (const node of nodes) {
    if (node.type !== 'repeat') continue;
    if (node.body.length === 0) return { code: 'empty_loop', nodeId: node.id };
    const inner = findSequenceProblem(node.body);
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
