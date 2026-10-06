import { RuleEditor } from './RuleEditor.js';
import { SequenceEditor } from './SequenceEditor.js';

/** Challenge kind → editor. A new kind of challenge only needs a new entry here. */
const EDITORS = {
  sequence: SequenceEditor,
  rules: RuleEditor,
};

export function createEditor(challenge, deps) {
  const Editor = EDITORS[challenge.kind];
  if (!Editor) throw new Error(`Sem editor para "${challenge.kind}"`);
  return new Editor({ challenge, ...deps });
}
