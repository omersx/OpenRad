"use client"

import * as React from "react"
import { PatientForm } from "@/components/dashboard/PatientForm";
import { StudyPlaceholder } from "@/components/dashboard/StudyPlaceholder";
import { ReportView } from "@/components/dashboard/ReportView";
import { ImageViewer } from "@/components/dashboard/ImageViewer";
import { generateReport } from "@/lib/api";
import { PatientContext, ReportData } from "@/types";

export default function Home() {
  const [report, setReport] = React.useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [patientImage, setPatientImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (patientImage) {
      const url = URL.createObjectURL(patientImage);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [patientImage]);

  const handleGenerate = async (data: PatientContext) => {
    setIsGenerating(true);
    setPatientImage(data.image || null);
    try {
      // Check if a webhook URL is configured (env or localStorage)
      let hasWebhook = !!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!hasWebhook && typeof window !== 'undefined') {
        try {
          const savedConfig = localStorage.getItem("openrad_config");
          if (savedConfig) {
            const config = JSON.parse(savedConfig);
            hasWebhook = !!(config.n8nWebhookUrl && config.n8nWebhookUrl.trim());
          }
        } catch (e) { /* ignore */ }
      }

      // Simulate a delay for better UX only if using mock data
      if (!hasWebhook) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const reports = await generateReport(data);
      if (reports && reports.length > 0) {
        setReport(reports[0]);
      }
    } catch (error) {
      console.error("Failed to generate report", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to generate report: ${errMsg}. Please check your n8n webhook URL in Settings and try again.`);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleNewPatient = () => {
    setReport(null);
    setPatientImage(null);
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Panel - Patient Entry OR Image Viewer */}
      <div className={`w-full md:w-[450px] md:min-w-[450px] h-auto md:h-full border-b md:border-b-0 md:border-r border-border-primary bg-bg-primary overflow-hidden transition-all duration-300`}>
        {report ? (
          <ImageViewer
            imageSrc={imagePreview || (process.env.NODE_ENV === 'development' ? "/placeholder-xray.png" : null)}
            className="w-full h-full"
            isCollapsed={false}
            onToggleCollapse={() => { }} // Not needed in this layout for now
          />
        ) : (
          <div className="h-full overflow-y-auto">
            <PatientForm onSubmit={handleGenerate} isGenerating={isGenerating} />
          </div>
        )}
      </div>

      {/* Right Panel - Viewer/Report Area */}
      <div className={`flex-1 h-full bg-bg-primary p-4 overflow-hidden`}>
        {report ? (
          <ReportView
            report={report}
            onNewPatient={handleNewPatient}
            imagePreview={imagePreview}
            reportId={report.report_header.report_id}
          />
        ) : (
          <StudyPlaceholder />
        )}
      </div>
    </div>
  );
}
