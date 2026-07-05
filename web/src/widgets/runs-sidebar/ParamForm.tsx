import type { AlgorithmMeta } from "@shared/api/types";
import { NumberField } from "@shared/ui";

interface ParamFormProps {
  meta: AlgorithmMeta | undefined;
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
}

/** Форма параметров генерируется из метаданных оптимизатора/планировщика —
 * добавление нового алгоритма на бэкенде не требует правок здесь. */
export function ParamForm({ meta, values, onChange }: ParamFormProps) {
  if (!meta || Object.keys(meta.params).length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(meta.params).map(([key, param]) => (
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
