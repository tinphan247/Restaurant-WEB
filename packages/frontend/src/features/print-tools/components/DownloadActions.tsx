import { useState } from 'react';
import { saveAs } from 'file-saver';

interface Props {
    tableId: string;
}

export const DownloadActions = ({ tableId }: Props) => {
    const [loadingType, setLoadingType] = useState<'pdf' | null>(null);

    const handleDownload = async () => {
        try {
            setLoadingType('pdf');

            const baseUrl = import.meta.env.VITE_API_URL || '';
            const url = `${baseUrl}/api/admin/tables/${tableId}/qr/download`;
            const fileName = `Table-${tableId}.pdf`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Download failed:", response.status, errorText);
                throw new Error(`Download error: ${response.statusText}`);
            }

            const blob = await response.blob();
            
            // Verify blob has content
            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            saveAs(blob, fileName);

        } catch (error) {
            console.error("Download error:", error);
            alert("Cannot download file. Please check backend.");
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loadingType !== null}
            title="Download as PDF (print-ready format)"
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-xs sm:text-sm font-medium transition w-full sm:w-auto flex-1 sm:flex-initial"
        >
            {loadingType === 'pdf' ? 'Đang tạo...' : '📄 Tải PDF'}
        </button>
    );
};
