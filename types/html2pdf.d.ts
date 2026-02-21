declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number] | [number, number, number, number];
        filename?: string;
        image?: { type: string; quality: number };
        enableLinks?: boolean;
        html2canvas?: any;
        jsPDF?: any;
    }

    interface Html2PdfWorker {
        from(element: HTMLElement | string): Html2PdfWorker;
        set(options: Html2PdfOptions): Html2PdfWorker;
        save(): Promise<void>;
        outputPdf(type?: string): Promise<string | Blob | ArrayBuffer>; // Add more if needed
    }

    function html2pdf(): Html2PdfWorker;
    export default html2pdf;
}
