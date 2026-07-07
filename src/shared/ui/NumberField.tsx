import { useEffect, useRef, useState } from "react";

import { cn } from "@shared/lib/cn";

import { Tooltip } from "./Tooltip";

interface NumberFieldProps {
  label?: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  inputClassName?: string;
}

/** Текстовое поле с числовым буфером: во время набора («-», «1.», «1e-»)
 * промежуточные состояния не отбрасываются, наружу уходит только валидное
 * конечное число, без сообщения об ошибке (сохраняется последнее валидное
 * значение). */
export function NumberField({ label, description, value, onChange, className, inputClassName }: NumberFieldProps) {
  const [text, setText] = useState(() => String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  const field = (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        const parsed = Number(next);
        if (next.trim() !== "" && Number.isFinite(parsed)) onChange(parsed);
      }}
      onBlur={() => {
        focused.current = false;
        setText(String(value));
      }}
      className={cn(
        "h-7 w-full rounded-sm border border-border bg-bg px-2 font-mono text-xs text-text",
        "focus:outline focus:outline-1 focus:outline-accent",
        inputClassName,
      )}
    />
  );

  if (!label) return field;

  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <Tooltip content={description}>
        <span className="w-fit cursor-default font-sans text-[11px] text-text-muted">{label}</span>
      </Tooltip>
      {field}
    </label>
  );
}
