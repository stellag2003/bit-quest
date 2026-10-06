import { ChallengeEvaluator } from '../domain/ChallengeEvaluator.js';
import { createCommandRegistry } from '../domain/commands.js';
import { Curriculum } from '../domain/Curriculum.js';
import { createInitialProgress, migrateProgress } from '../domain/progress.js';
import { ProgressionRules } from '../domain/ProgressionRules.js';
import { RuleRunner } from '../domain/runners/RuleRunner.js';
import { SequenceRunner } from '../domain/runners/SequenceRunner.js';
import { createSensorRegistry } from '../domain/sensors.js';
import { PurchasePalette, RefillEnergy, SelectPalette } from './economy.js';
import { CompleteLesson, StartChallenge, SubmitProgram } from './learning.js';
import { ProgressStore } from './ProgressStore.js';
import { ResetProgress, SelectMentor, UpdateSettings } from './profile.js';
import { MapOverviewQuery, PlayerSummaryQuery } from './queries.js';

/**
 * Application composition: builds the rules and use cases from content and
 * infrastructure ports ({ repository, clock, bus }). No DOM in here.
 */
export function createGame({ content, repository, clock, bus }) {
  const { fases, mentors, achievements, palettes, economy } = content;
  const curriculum = new Curriculum(fases);
  const rules = new ProgressionRules(curriculum);
  const commands = createCommandRegistry();
  const sensors = createSensorRegistry();
  const evaluator = new ChallengeEvaluator([new SequenceRunner(commands), new RuleRunner(commands, sensors)]);
  const defaults = { firstMentor: mentors[0].id, firstPalette: palettes[0].id };

  const store = new ProgressStore({
    repository,
    clock,
    createInitial: (now) => createInitialProgress(now, defaults),
    migrate: (saved, now) => migrateProgress(saved, now, defaults),
  });

  const submitProgram = new SubmitProgram({
    store, curriculum, rules, evaluator, clock, bus, achievements, mentorCount: mentors.length,
  });

  return {
    store,
    curriculum,
    rules,
    evaluator,
    content,
    completeLesson: new CompleteLesson({ store, rules, bus }),
    startChallenge: new StartChallenge({ store, curriculum, rules, submitProgram }),
    refillEnergy: new RefillEnergy({ store, clock, price: economy.energyRefillPrice, bus }),
    purchasePalette: new PurchasePalette({ store, palettes, bus }),
    selectPalette: new SelectPalette({ store }),
    selectMentor: new SelectMentor({ store }),
    updateSettings: new UpdateSettings({ store }),
    resetProgress: new ResetProgress({ store, bus }),
    playerSummary: new PlayerSummaryQuery({ store, rules, curriculum, clock, mentors }),
    mapOverview: new MapOverviewQuery({ store, rules, curriculum }),
  };
}
