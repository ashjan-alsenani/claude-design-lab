import { toArabicDigits } from '../lib/digits';
import { play } from '../lib/sound';

const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', '.'];

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  unit?: string;
  shake?: boolean;
}

/** Big, child-friendly number keypad (also accepts the physical keyboard). */
export function NumberPad({ value, onChange, onSubmit, disabled, unit, shake }: Props) {
  const press = (k: string) => {
    if (disabled) return;
    play('tap');
    if (k === '.' && value.includes('.')) return;
    if (k === '-' && value.length > 0) return;
    if (value.replace(/[-.]/g, '').length >= 12) return;
    onChange(value + k);
  };
  return (
    <div className="numpad">
      <div className={`numpad__display ${shake ? 'wiggle' : ''}`} dir="ltr">
        <input
          aria-label="اكتبي الإجابة"
          inputMode="decimal"
          value={toArabicDigits(value)}
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value
              .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
              .replace(/[٫,،]/g, '.')
              .replace(/[^0-9.-]/g, '');
            onChange(raw);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          placeholder="؟"
        />
        {unit && <span className="numpad__unit">{unit}</span>}
      </div>
      <div className="numpad__keys" dir="ltr">
        {keys.map((k) => (
          <button key={k} type="button" className="numpad__key" onClick={() => press(k)} disabled={disabled} aria-label={k === '.' ? 'فاصلة عشرية' : k === '-' ? 'سالب' : k}>
            {k === '.' ? ',' : k === '-' ? '−' : toArabicDigits(k)}
          </button>
        ))}
        <button type="button" className="numpad__key numpad__key--del" onClick={() => !disabled && onChange(value.slice(0, -1))} disabled={disabled} aria-label="امسحي">
          ⌫
        </button>
        <button type="button" className="numpad__key numpad__key--ok" onClick={onSubmit} disabled={disabled || value === '' || value === '-'}>
          تحقّق ✔️
        </button>
      </div>
    </div>
  );
}
