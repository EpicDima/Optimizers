import { Panel } from "@shared/ui";

import { FormulaDisplay } from "./FormulaDisplay";
import { PlotSettingsControls } from "./PlotSettingsControls";
import { PresetPicker } from "./PresetPicker";
import { RangeEditor } from "./RangeEditor";

export function TopBar() {
  return (
    <Panel className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 p-3">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <FormulaDisplay />
          <PresetPicker />
          <RangeEditor />
        </div>

        <PlotSettingsControls />
      </div>
    </Panel>
  );
}
