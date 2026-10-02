import { Link } from 'react-router-dom';
import { MascotMessage } from '../components/MascotMessage';

export function LockedNotice({ title, text }: { title: string; text: string }) {
  return (
    <div className="page locked-notice">
      <MascotMessage mood="encouraging" size={120}>
        <strong>{title}</strong>
        <br />
        {text}
      </MascotMessage>
      <Link to="/journey" className="btn btn--accent btn--lg">
        🗺️ إلى خريطة الرحلة
      </Link>
    </div>
  );
}
