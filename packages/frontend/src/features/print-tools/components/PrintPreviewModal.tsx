import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeDisplay } from './QRCodeDisplay';

interface Props {
  isOpen: boolean;
  table: any;
  onClose: () => void;
}

export const PrintPreviewModal = ({ isOpen, table, onClose }: Props) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Print Preview</h2>

          <div ref={componentRef} className="border p-4 bg-white">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Table: {table.tableNumber}</h3>
              <p className="text-gray-600">Location: {table.location}</p>
            </div>

            <div className="flex justify-center mb-4">
              <QRCodeDisplay value={table.qrToken || table.id} size={200} />
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Capacity: {table.capacity} persons</p>
              <p>Status: {table.status}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
