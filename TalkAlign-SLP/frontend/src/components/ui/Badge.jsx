import { statusBadgeClass } from '../../utils/helpers.js';

export default function Badge({ children, variant, status }) {
  // If a `status` string is passed, auto-map it to the right class
  const cls = status ? statusBadgeClass(status) : (variant ? `badge-${variant}` : 'badge-blue');
  return <span className={cls}>{children}</span>;
}
