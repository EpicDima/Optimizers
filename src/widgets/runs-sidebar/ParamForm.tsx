import type { AlgorithmMeta } from "@shared/api/types";
import { NumberField } from "@shared/ui";

interface ParamFormProps {
  meta: AlgorithmMeta | undefined;
  values: Record<string, number>;
  excludeKeys?: string[];
  onChange: (key: string, value: number) => void;
}

export function ParamForm({ meta, values, excludeKeys, onChange }: ParamFormProps) {
  if (!meta || Object.keys(meta.params).length === 0) return null;

  const entries = Object.entries(meta.params).filter(([key]) => !excludeKeys?.includes(key));
  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([key, param]) => (
        <NumberField
          key={key}
          label={key}
          description={param.description ?? undefined}
          value={values[key] ?? param.default}
          onChange={(value) => onChange(key, value)}
        />
      ))}
    </div>
  );
}
