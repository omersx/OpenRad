import * as React from "react";
import { Button } from "@/components/ui/basic";
import { X, CheckCircle, Trash2, PenTool } from "lucide-react";

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (signature: string, comments: string) => void;
    currentUser: { name: string };
}

export function ApprovalModal({ isOpen, onClose, onConfirm, currentUser }: ApprovalModalProps) {
    const [comments, setComments] = React.useState("");
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [hasSignature, setHasSignature] = React.useState(false);

    // Canvas drawing logic
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
        let offsetX, offsetY;
        if ('touches' in e) {
            const rect = canvas.getBoundingClientRect();
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;
        } else {
            offsetX = e.nativeEvent.offsetX;
            offsetY = e.nativeEvent.offsetY;
        }
        return { offsetX, offsetY };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const signature = canvas.toDataURL(); // Get base64 signature
        onConfirm(signature, comments);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-bg-surface w-[500px] rounded-lg shadow-xl border border-border-primary overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border-primary bg-green-50">
                    <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={20} />
                        <h2 className="text-lg font-bold">Approve Report</h2>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-800">
                        You are approving this report as <strong>{currentUser.name}</strong> on {new Date().toLocaleDateString()}.
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Comments (Optional)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Any final notes..."
                            className="w-full px-3 py-2 border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-text-primary">
                                Signature <span className="text-red-500">*</span>
                            </label>
                            <button
                                onClick={clearCanvas}
                                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                                disabled={!hasSignature}
                            >
                                <Trash2 size={12} /> Clear
                            </button>
                        </div>
                        <div className="border border-border-primary rounded-md bg-white cursor-crosshair touch-none">
                            <canvas
                                ref={canvasRef}
                                width={450}
                                height={150}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-[150px]"
                            />
                            {!hasSignature && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 opacity-0">
                                    <PenTool size={24} />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1">Sign above using your mouse or touch screen.</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 bg-bg-panel border-t border-border-primary">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleConfirm}
                        disabled={!hasSignature}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Confirm Approval
                    </Button>
                </div>
            </div>
        </div>
    );
}
