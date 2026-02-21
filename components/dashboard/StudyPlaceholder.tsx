import { FileText } from "lucide-react"

export function StudyPlaceholder() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-bg-panel/50 rounded-xl border-2 border-dashed border-border-card m-6">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-border-card flex items-center justify-center">
                    <FileText className="w-8 h-8 text-text-muted" />
                </div>
                <div>
                    <h3 className="text-xl font-medium text-text-heading mb-2">Ready to Assist</h3>
                    <p className="text-text-secondary">Fill in the patient details and upload an image to generate a comprehensive AI-assisted radiology report.</p>
                </div>
            </div>
        </div>
    )
}
