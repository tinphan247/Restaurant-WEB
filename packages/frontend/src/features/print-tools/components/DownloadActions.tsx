import { useState } from 'react';
import { saveAs } from 'file-saver';

interface Props {
    tableId: string;
}

export const DownloadActions = ({ tableId }: Props) => {
    const [loadingType, setLoadingType] = useState<'pdf' | 'zip' | null>(null);

    const handleDownload = async (type: 'pdf' | 'zip') => {
        try {
            setLoadingType(type);

            const isPdf = type === 'pdf';
            // Use relative URLs to work with Vite proxy
            const url = isPdf
                ? `/api/admin/tables/${tableId}/qr/download`
                : `/api/admin/tables/qr/download-all`;

            const fileName = isPdf
                ? `Table-${tableId}.pdf`
                : `All-QR-Codes.zip`;

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
        <div className="flex gap-2 mt-2">
            <button
                onClick={() => handleDownload('pdf')}
                disabled={loadingType !== null}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {loadingType === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button
                onClick={() => handleDownload('zip')}
                disabled={loadingType !== null}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
                {loadingType === 'zip' ? 'Compressing...' : 'Download All'}
            </button>
        </div>
    );
};
