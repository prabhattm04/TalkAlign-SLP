export default function Card({ children, className = '', header, footer }) {
  return (
    <div className={`card ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-slate-100">{header}</div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}
