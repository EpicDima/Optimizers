import { useRunsStore } from "@entities/run";
import { useFunctionPreview, useFunctionStore } from "@entities/test-function";
import { cn } from "@shared/lib/cn";

/** Тонкая полоса статуса — веб-аналог self.statusbar.showMessage(...) из
 * main.pyw: показывает самое важное состояние прямо сейчас, в порядке
 * приоритета. Пустая строка (как и в десктопе после успешной проверки)
 * означает, что показывать нечего. */
export function StatusBar() {
  const { isRunning, error, slots, results } = useRunsStore();
  const { formula, range, gridCount } = useFunctionStore();
  const preview = useFunctionPreview({ formula, range, count: gridCount });

  const message = statusMessage({ isRunning, error, slots, results, previewValid: preview.data?.valid, previewError: preview.data?.error });

  return (
    <div className="flex h-8 items-center gap-2 border-t border-border bg-bg-elevated px-3 font-body text-xs">
      {message && <span className={cn(message.tone === "danger" && "text-danger")}>{message.text}</span>}
    </div>
  );
}

interface StatusInput {
  isRunning: boolean;
  error: string | null;
  slots: { slotId: string; optimizer: string }[];
  results: Record<string, { error: string | null }>;
  previewValid: boolean | undefined;
  previewError: string | null | undefined;
}

interface StatusMessage {
  text: string;
  tone: "neutral" | "danger";
}

function statusMessage({ isRunning, error, slots, results, previewValid, previewError }: StatusInput): StatusMessage | null {
  if (isRunning) return { text: "Считаем…", tone: "neutral" };

  if (error) return { text: error, tone: "danger" };

  const failedSlots = slots.filter((slot) => results[slot.slotId]?.error);
  if (failedSlots.length > 0) {
    const first = failedSlots[0];
    const firstMessage = `Оптимизатор «${first.optimizer}»: ${results[first.slotId]?.error}`;
    const rest = failedSlots.length - 1;
    return { text: rest > 0 ? `${firstMessage} (ещё ${rest})` : firstMessage, tone: "danger" };
  }

  if (previewValid === false) return { text: previewError ?? "Неправильная функция!", tone: "danger" };

  return null;
}
