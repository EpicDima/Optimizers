import { adaBeliefOptimizer } from "./ada-belief";
import { adadeltaOptimizer } from "./adadelta";
import { adafactorOptimizer } from "./adafactor";
import { adagradOptimizer } from "./adagrad";
import { adamOptimizer } from "./adam";
import { adamaxOptimizer } from "./adamax";
import { adamWOptimizer } from "./adamw";
import { adanOptimizer } from "./adan";
import { ademamixOptimizer } from "./ademamix";
import { adoptOptimizer } from "./adopt";
import { asgdOptimizer } from "./asgd";
import { cautiousAdamWOptimizer } from "./cautious-adamw";
import { lbfgsOptimizer } from "./lbfgs";
import { levenbergMarquardtOptimizer } from "./levenberg-marquardt";
import { lionOptimizer } from "./lion";
import { marsOptimizer } from "./mars";
import { momentumOptimizer } from "./momentum";
import { nAdamOptimizer } from "./nadam";
import { nesterovOptimizer } from "./nesterov";
import { newtonOptimizer } from "./newton";
import { prodigyOptimizer } from "./prodigy";
import { quickPropOptimizer } from "./quickprop";
import { rAdamOptimizer } from "./radam";
import { rmsPropOptimizer } from "./rmsprop";
import { rpropOptimizer } from "./rprop";
import { scheduleFreeAdamWOptimizer } from "./schedule-free-adamw";
import { sgdOptimizer } from "./sgd";
import { shampooOptimizer } from "./shampoo";
import { sophiaOptimizer } from "./sophia";
import type { OptimizerDescriptor } from "./types";

const OPTIMIZERS: readonly OptimizerDescriptor[] = [
  adaBeliefOptimizer,
  adadeltaOptimizer,
  adafactorOptimizer,
  adagradOptimizer,
  adamOptimizer,
  adamaxOptimizer,
  adamWOptimizer,
  adanOptimizer,
  ademamixOptimizer,
  adoptOptimizer,
  asgdOptimizer,
  cautiousAdamWOptimizer,
  lbfgsOptimizer,
  levenbergMarquardtOptimizer,
  lionOptimizer,
  marsOptimizer,
  momentumOptimizer,
  nAdamOptimizer,
  nesterovOptimizer,
  newtonOptimizer,
  prodigyOptimizer,
  quickPropOptimizer,
  rAdamOptimizer,
  rmsPropOptimizer,
  rpropOptimizer,
  scheduleFreeAdamWOptimizer,
  sgdOptimizer,
  shampooOptimizer,
  sophiaOptimizer,
];

const REGISTRY = new Map(OPTIMIZERS.map((optimizer) => [optimizer.name, optimizer]));

export function optimizerNames(): string[] {
  return OPTIMIZERS.map((optimizer) => optimizer.name).sort();
}

export function getOptimizerDescriptor(name: string): OptimizerDescriptor | undefined {
  return REGISTRY.get(name);
}
