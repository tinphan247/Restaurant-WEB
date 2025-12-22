import { saveAs as saveAsBlob } from 'file-saver';

export const fileSaver = {
  saveAs: (blob: Blob, filename: string) => {
    saveAsBlob(blob, filename);
  },

  downloadPdf: (blob: Blob, filename: string) => {
    saveAsBlob(blob, filename);
  },

  downloadZip: (blob: Blob, filename: string) => {
    saveAsBlob(blob, filename);
  },
};
