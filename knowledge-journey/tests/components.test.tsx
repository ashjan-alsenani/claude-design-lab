import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuestionCard } from '../src/components/QuestionCard';
import { RichText } from '../src/components/RichText';
import { DEFAULT_QUESTIONS, prepare } from '../src/lib/questions';
import { useCountdown } from '../src/lib/useCountdown';

describe('<QuestionCard>', () => {
  it('locks after an answer and explains the correct one when wrong', () => {
    const q = prepare(DEFAULT_QUESTIONS.find((x) => x.id === 'q10')!);
    const wrong = q.options.findIndex((_, i) => i !== q.answer);
    const onPick = vi.fn();
    const { rerender } = render(<QuestionCard q={q} picked={null} onPick={onPick} />);
    fireEvent.click(screen.getAllByRole('button')[wrong]);
    expect(onPick).toHaveBeenCalledWith(wrong);
    rerender(<QuestionCard q={q} picked={wrong} onPick={onPick} />);
    expect(screen.getByText(/ليست الإجابة الصحيحة/)).toBeInTheDocument();
    expect(screen.getByText(/الإجابة الصحيحة:/)).toBeInTheDocument();
    expect(screen.getByText(q.explanation)).toBeInTheDocument();
    for (const b of screen.getAllByRole('button')) expect(b).toBeDisabled();
  });
});

describe('<RichText>', () => {
  it('renders verse tokens as Uthmani quotes with a reference', () => {
    const { container } = render(<RichText text="قال تعالى: [[nisa80]]" />);
    expect(container.querySelector('.verse')?.textContent?.normalize('NFC')).toContain('مَّن يُطِعِ'.normalize('NFC'));
    expect(container.textContent).toContain('(النساء: 80)');
  });
});

describe('useCountdown', () => {
  afterEach(() => vi.useRealTimers());
  it('counts real time down and fires once on timeout', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useCountdown(15, true, 1, onTimeout));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBeCloseTo(10, 0);
    act(() => {
      vi.advanceTimersByTime(11000);
    });
    expect(result.current).toBe(0);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
