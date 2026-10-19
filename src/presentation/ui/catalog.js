import { t } from '../i18n/index.js';

/** How domain ids are shown to kids (labels + icons). Text is looked up on access, in the current language. */
const entry = (prefix, iconName) => ({
  icon: iconName,
  get label() { return t(`${prefix}.label`); },
  get detail() { return t(`${prefix}.detail`, {}, ''); },
  get aria() { return t(`${prefix}.aria`); },
});

export const COMMAND_UI = {
  walk: entry('cmd.walk', 'walk'),
  turnLeft: entry('cmd.turnLeft', 'turnLeft'),
  turnRight: entry('cmd.turnRight', 'turnRight'),
  jump: entry('cmd.jump', 'jump'),
  repeat: entry('cmd.repeat', 'repeat'),
  call: entry('cmd.call', 'star'),
};

export const SENSOR_UI = {
  rockAhead: entry('sensor.rockAhead', 'rock'),
  wallAhead: entry('sensor.wallAhead', 'wall'),
};
