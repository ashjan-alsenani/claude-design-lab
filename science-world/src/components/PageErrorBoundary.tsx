import { Component, type ReactNode } from 'react';
import { Mascot } from './Mascot';

/** If a page still cannot load (e.g. offline), show a friendly message with a retry button. */
export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="loading" role="alert">
        <Mascot mood="surprised" size={110} />
        <strong>أوه! لم تُفتح الصفحة.</strong>
        <span>تأكدي من الاتصال بالإنترنت ثم اضغطي «حاولي مرة أخرى».</span>
        <button type="button" className="btn btn--sun btn--lg" onClick={() => window.location.reload()}>
          🔄 حاولي مرة أخرى
        </button>
      </div>
    );
  }
}
