"use client"

import * as React from "react"
import { Upload } from "lucide-react"
import { Card, CardContent, Input, Label, Textarea, Button } from "@/components/ui/basic"
import { PatientContext } from "@/types"

interface PatientFormProps {
    onSubmit: (data: PatientContext) => void;
    isGenerating: boolean;
}

export function PatientForm({ onSubmit, isGenerating }: PatientFormProps) {
    const [dragActive, setDragActive] = React.useState(false)
    const [formData, setFormData] = React.useState<PatientContext>({
        fullName: "",
        age: 0,
        gender: "M",
        indication: "",
        symptoms: "",
        history: "",
        modality: "X-Ray",
        image: null
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'age' ? parseInt(value) || 0 : value }));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files![0] }));
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFormData(prev => ({ ...prev, image: e.dataTransfer.files[0] }));
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    }

    const handleSubmit = () => {
        onSubmit(formData);
    }

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-text-heading">Case Details</h2>
                <p className="text-text-secondary text-sm">Enter patient and study information</p>
            </div>

            <Card className="flex-1 overflow-auto bg-bg-surface border-border-primary">
                <CardContent className="space-y-6 pt-6">

                    {/* Patient Information */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Patient Information</h3>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-6">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input id="fullName" placeholder="e.g. John Doe" value={formData.fullName} onChange={handleChange} />
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <Label htmlFor="age">Age *</Label>
                                <Input id="age" placeholder="00" type="number" value={formData.age || ''} onChange={handleChange} />
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <Label htmlFor="gender">Gender</Label>
                                <select id="gender" className="flex h-10 w-full rounded-md border border-border-primary bg-bg-panel px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={formData.gender} onChange={handleChange}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Context */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Clinical Context</h3>
                        <div>
                            <Label htmlFor="indication">Indication *</Label>
                            <Input id="indication" placeholder="e.g. Rule out pneumonia" value={formData.indication} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="symptoms">Symptoms</Label>
                            <Input id="symptoms" placeholder="e.g. Cough, fever" value={formData.symptoms} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="history">Patient History</Label>
                            <Textarea id="history" placeholder="Relevant medical history..." className="resize-none h-20" value={formData.history} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Study Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Study Details</h3>
                        <div>
                            <Label htmlFor="modality">Modality *</Label>
                            <select id="modality" className="flex h-10 w-full rounded-md border border-border-primary bg-bg-panel px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={formData.modality} onChange={handleChange}>
                                <option value="X-Ray">X-Ray</option>
                                <option value="CT">CT</option>
                                <option value="MRI">MRI</option>
                                <option value="Ultrasound">Ultrasound</option>
                            </select>
                        </div>
                    </div>

                    {/* Medical Image */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Medical Image</h3>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <div
                            className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                    ${dragActive ? 'border-primary bg-primary/5' : 'border-border-card hover:bg-bg-panel'}
                  `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={handleUploadClick}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 rounded-full bg-bg-panel">
                                    <Upload className="w-6 h-6 text-text-muted" />
                                </div>
                                <p className="text-sm font-medium text-text-primary">
                                    {formData.image ? formData.image.name : <span>Drag & drop image here or <span className="text-primary hover:underline">browse</span></span>}
                                </p>
                                <p className="text-xs text-text-muted">Supports JPEG, PNG, PDF (max 8MB)</p>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isGenerating}>
                        {isGenerating ? "Processing..." : "Generate Report"}
                    </Button>

                </CardContent>
            </Card>
        </div>
    )
}
