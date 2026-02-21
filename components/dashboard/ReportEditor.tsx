import * as React from "react";
import { ReportData } from "@/types";
import { Button } from "@/components/ui/basic";
import { Save, X, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface ReportEditorProps {
    report: ReportData;
    onSave: (updatedReport: ReportData) => void;
    onCancel: () => void;
}

export function ReportEditor({ report, onSave, onCancel }: ReportEditorProps) {
    // Local state for editing fields
    const [findings, setFindings] = React.useState(report.findings);
    const [impression, setImpression] = React.useState(report.impression.join("\n"));
    const [recommendations, setRecommendations] = React.useState(report.recommendations?.join("\n") || "");
    const [urgency, setUrgency] = React.useState(report.urgency);

    const handleSave = () => {
        const updatedReport: ReportData = {
            ...report,
            findings: findings,
            impression: impression.split("\n").filter(line => line.trim() !== ""),
            recommendations: recommendations.split("\n").filter(line => line.trim() !== ""),
            urgency: urgency
        };
        onSave(updatedReport);
    };

    const handleFindingChange = (index: number, field: 'observation' | 'anatomical_region', value: string) => {
        const newFindings = [...findings];
        newFindings[index] = { ...newFindings[index], [field]: value };
        setFindings(newFindings);
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in fade-in duration-200">
            {/* Word-like Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="flex bg-white border border-gray-300 rounded shadow-sm">
                        <ToolbarButton icon={<Bold size={16} />} title="Bold" />
                        <ToolbarButton icon={<Italic size={16} />} title="Italic" />
                        <ToolbarButton icon={<Underline size={16} />} title="Underline" />
                    </div>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <div className="flex bg-white border border-gray-300 rounded shadow-sm">
                        <ToolbarButton icon={<AlignLeft size={16} />} title="Align Left" />
                        <ToolbarButton icon={<AlignCenter size={16} />} title="Align Center" />
                        <ToolbarButton icon={<AlignRight size={16} />} title="Align Right" />
                        <ToolbarButton icon={<List size={16} />} title="Bullet List" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel} className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300">
                        <X size={16} className="mr-1.5" /> Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Save size={16} className="mr-1.5" /> Save Changes
                    </Button>
                </div>
            </div>

            {/* Editor Content - mimicking a document page */}
            <div className="flex-1 overflow-y-auto bg-gray-200 p-8">
                <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[800px] p-12 border border-gray-300 outline-none">

                    {/* Header Info (Read Only context) */}
                    <div className="mb-8 border-b border-gray-200 pb-4 opacity-70 pointer-events-none select-none">
                        <h1 className="text-2xl font-bold text-gray-900">{report.patient.name}</h1>
                        <p className="text-sm text-gray-500">{report.study.modality} • {report.study.examination}</p>
                    </div>

                    {/* Editable Sections */}
                    <div className="space-y-8">
                        {/* Findings Section */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Findings</h3>
                            <div className="space-y-4">
                                {findings.map((finding, idx) => (
                                    <div key={idx} className="flex gap-2 items-start p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                        <input
                                            value={finding.anatomical_region}
                                            onChange={(e) => handleFindingChange(idx, 'anatomical_region', e.target.value)}
                                            className="font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-1/4"
                                            placeholder="Region"
                                        />
                                        <textarea
                                            value={finding.observation}
                                            onChange={(e) => handleFindingChange(idx, 'observation', e.target.value)}
                                            className="flex-1 text-gray-700 bg-transparent border border-gray-200 rounded p-1 focus:border-blue-500 outline-none resize-none"
                                            rows={2}
                                            placeholder="Observation..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Impression Section */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Impression</h3>
                            <textarea
                                value={impression}
                                onChange={(e) => setImpression(e.target.value)}
                                className="w-full min-h-[150px] p-2 text-lg font-medium text-gray-900 border border-gray-200 rounded focus:border-blue-500 outline-none resize-y"
                                placeholder="Enter impression..."
                            />
                        </section>

                        {/* Urgency Selector */}
                        <section className="bg-blue-50 p-4 rounded border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Urgency</h3>
                            <div className="flex gap-4">
                                {(['Routine', 'Urgent', 'Critical'] as const).map((level) => (
                                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="urgency"
                                            value={level}
                                            checked={urgency === level}
                                            onChange={() => setUrgency(level)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`text-sm font-medium ${level === 'Critical' ? 'text-red-600' :
                                                level === 'Urgent' ? 'text-orange-600' : 'text-gray-700'
                                            }`}>{level}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Recommendations Section */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Recommendations</h3>
                            <textarea
                                value={recommendations}
                                onChange={(e) => setRecommendations(e.target.value)}
                                className="w-full min-h-[100px] p-2 text-gray-700 border border-gray-200 rounded focus:border-blue-500 outline-none resize-y"
                                placeholder="Enter recommendations (one per line)..."
                            />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <button
            title={title}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-sm"
        >
            {icon}
        </button>
    );
}
