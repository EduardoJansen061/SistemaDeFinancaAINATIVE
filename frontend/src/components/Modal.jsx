import { RiCloseLine } from 'react-icons/ri';

/**
 * Reusable modal component
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth = '560px' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-box" style={{ maxWidth }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Fechar"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;
