import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PolicyConfirmModal: React.FC<Props> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold">Cancellation Policy</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-700">
        Before proceeding with your booking, please review our cancellation policy. By accepting this policy, you confirm that you understand the refund terms and conditions.
          </p>

          <p className="text-sm text-gray-600">
            View full policy: <Link to="/politica-de-cancelacion" className="text-teal-600 underline">Cancellation Policy</Link>
          </p>

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={onAccept} className="px-5 py-2 bg-teal-600 text-white rounded-lg">I Accept</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyConfirmModal;
