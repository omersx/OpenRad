export type ReportStatus = 'Pending' | 'Approved' | 'Rejected' | 'Final';

export interface ReportFooter {
    prepared_by: string;
    department: string;
    report_status: ReportStatus;
    approved_by?: string;
    approved_at?: string;
    signature?: string;
    rejection_reason?: string;
}

export interface Comment {
    id: string;
    author: string;
    role: string;
    text: string;
    timestamp: string;
}

export interface AuditLog {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details?: string;
}

export interface PatientContext {
    fullName: string;
    age: number;
    gender: string;
    indication: string;
    symptoms: string;
    history: string;
    modality: string;
    image?: File | null;
}

export interface Finding {
    anatomical_region: string;
    observation: string;
    status: "normal" | "abnormal";
}

export interface ReportData {
    report_header: {
        hospital_name: string;
        department: string;
        report_title: string;
        report_id: string;
        report_date: string;
    };
    patient: {
        name: string;
        age: number;
        gender: string;
    };
    clinical_information: {
        symptoms: string;
        history: string;
        indication: string;
    };
    study: {
        modality: string;
        examination: string;
        views: string;
    };
    findings: Finding[];
    impression: string[];
    urgency: "Routine" | "Urgent" | "Critical";
    recommendations: string[];
    report_footer: ReportFooter;
    disclaimer: string;
    image_data?: string; // Base64 encoded image
    collaboration?: {
        comments: Comment[];
        logs: AuditLog[];
    };
}
