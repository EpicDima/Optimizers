import { useRunsStore } from "@entities/run";
import { useFunctionPresets, useFunctionStore } from "@entities/test-function";
import { Select } from "@shared/ui";

export function PresetPicker() {
  const { data: presets } = useFunctionPresets();
  const presetName = useFunctionStore((state) => state.presetName);
  const applyPreset = useFunctionStore((state) => state.applyPreset);
  const setGlobalStart = useRunsStore((state) => state.setGlobalStart);

  function handleChange(name: string) {
    const preset = presets?.find((item) => item.name === name);
    if (!preset) return;
    applyPreset(preset);
    setGlobalStart(preset.start);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-[11px] text-text-muted">Пресет</span>
      <Select
        value={presetName ?? ""}
        onChange={handleChange}
        options={presets?.map((preset) => preset.name) ?? []}
        placeholder="Своя формула"
        className="w-48"
      />
    </div>
  );
}
