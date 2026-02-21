import * as React from "react";
import { Button } from "@/components/ui/basic";
import { X, AlertTriangle } from "lucide-react";

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, comment: string) => void;
}

export function RejectionModal({ isOpen, onClose, onConfirm }: RejectionModalProps) {
    const [reason, setReason] = React.useState("");
    const [comment, setComment] = React.useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-bg-surface w-[450px] rounded-lg shadow-xl border border-border-primary overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border-primary bg-red-50">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle size={20} />
                        <h2 className="text-lg font-bold">Reject Report</h2>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Main Reason for Rejection <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Incorrect Findings"
                            className="w-full px-3 py-2 border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Additional Comments
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Provide more details..."
                            className="w-full px-3 py-2 border border-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 bg-bg-panel border-t border-border-primary">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => onConfirm(reason, comment)}
                        disabled={!reason.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Confirm Rejection
                    </Button>
                </div>
            </div>
        </div>
    );
}
