import { useState } from 'react';
import { saveAs } from 'file-saver';

export const BulkDownloadActions = () => {
    const [loadingType, setLoadingType] = useState<'zip' | 'bulkPdf' | null>(null);

    const handleDownload = async (type: 'zip' | 'bulkPdf') => {
        try {
            setLoadingType(type);

            const baseUrl = import.meta.env.VITE_API_URL || '';
            let url = '';
            let fileName = '';

            if (type === 'bulkPdf') {
                url = `${baseUrl}/api/admin/tables/qr/download-all-pdf`;
                fileName = 'All-QR-Codes.pdf';
            } else {
                url = `${baseUrl}/api/admin/tables/qr/download-all`;
                fileName = 'All-QR-Codes.zip';
            }

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Download failed:", response.status, errorText);
                throw new Error(`Download error: ${response.statusText}`);
            }

            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            saveAs(blob, fileName);

        } catch (error) {
            console.error("Download error:", error);
            alert("Không thể tải file. Vui lòng kiểm tra backend.");
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
                onClick={() => handleDownload('zip')}
                disabled={loadingType !== null}
                title="Download all QR codes as PNG in ZIP"
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-xs sm:text-sm font-medium transition w-full sm:w-auto"
            >
                {loadingType === 'zip' ? 'Đang nén...' : '📦  ZIP'}
            </button>

            <button
                onClick={() => handleDownload('bulkPdf')}
                disabled={loadingType !== null}
                title="Download all QR codes as single PDF for bulk printing"
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-xs sm:text-sm font-medium transition w-full sm:w-auto"
            >
                {loadingType === 'bulkPdf' ? 'Đang tạo...' : '📋 Tất cả QR PDF'}
            </button>
        </div>
    );
};
