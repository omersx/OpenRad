import { PatientContext, ReportData, ReportStatus } from "@/types";
import { getSupabaseClient } from "./supabase";

export async function generateReport(data: PatientContext): Promise<ReportData[]> {
    // 1. Try to get webhook URL - prioritize localStorage config over env variable
    let webhookUrl: string | undefined = undefined;

    if (typeof window !== 'undefined') {
        try {
            const savedConfig = localStorage.getItem("openrad_config");
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.n8nWebhookUrl && config.n8nWebhookUrl.trim() !== '') {
                    webhookUrl = config.n8nWebhookUrl.trim();
                    console.log("[OpenRad] Using webhook URL from settings:", webhookUrl);
                }
            }
        } catch (e) {
            console.error("[OpenRad] Error reading config from localStorage:", e);
        }
    }

    // Fallback to env variable if not set in localStorage
    if (!webhookUrl && process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
        webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
        console.log("[OpenRad] Using webhook URL from env variable:", webhookUrl);
    }

    if (!webhookUrl) {
        console.warn("[OpenRad] No webhook URL configured. Returning mock data. Set the n8n Webhook URL in Settings.");

        // Convert image to base64 if provided for mock reports too
        let imageBase64: string | null = null;
        if (data.image) {
            imageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(data.image as File);
            });
        }

        const mockReports = mockReportResponse(data);

        // Attach image data to mock report
        if (mockReports.length > 0 && imageBase64) {
            mockReports[0].image_data = imageBase64;
        }

        // Save mock report for history testing
        await saveReport(mockReports[0]);
        return mockReports;
    }

    try {
        // Build multipart/form-data so the image arrives in n8n as binary data
        const formData = new FormData();

        // Patient fields
        formData.append("patient_name", data.fullName);
        formData.append("patient_age", String(data.age));
        formData.append("patient_gender", data.gender);

        // Clinical information fields
        formData.append("symptoms", data.symptoms);
        formData.append("history", data.history);
        formData.append("indication", data.indication);

        // Study fields
        formData.append("modality", data.modality);

        // We also keep a base64 copy for local storage / report preview
        let imageBase64: string | null = null;

        // Append image as binary file under the key "image"
        if (data.image) {
            const file = data.image as File;
            formData.append("image", file, file.name);

            // Also generate base64 for local report preview/history
            imageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        console.log("[OpenRad] Sending request to webhook:", webhookUrl);
        console.log("[OpenRad] Payload fields:", {
            patient_name: data.fullName,
            patient_age: data.age,
            patient_gender: data.gender,
            symptoms: data.symptoms,
            history: data.history,
            indication: data.indication,
            modality: data.modality,
            image: data.image ? `[binary file: ${(data.image as File).name}, ${(data.image as File).size} bytes]` : null,
        });

        // Send as multipart/form-data (do NOT set Content-Type header — the browser sets it automatically with the boundary)
        const response = await fetch(webhookUrl, {
            method: "POST",
            body: formData,
        });

        console.log("[OpenRad] Webhook response status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Could not read error body');
            console.error("[OpenRad] Webhook error response body:", errorText);
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const rawResponse = await response.json();
        console.log("[OpenRad] Webhook raw response:", rawResponse);

        // Handle various response formats from n8n
        let reports: ReportData[];
        if (Array.isArray(rawResponse)) {
            // n8n returned an array of reports
            reports = rawResponse;
        } else if (rawResponse && typeof rawResponse === 'object') {
            // n8n returned a single report object - check common wrapper patterns
            if (rawResponse.output && typeof rawResponse.output === 'object') {
                // n8n AI agent may wrap response in { output: ... }
                reports = Array.isArray(rawResponse.output) ? rawResponse.output : [rawResponse.output];
            } else if (rawResponse.data && typeof rawResponse.data === 'object') {
                // Another common pattern: { data: ... }
                reports = Array.isArray(rawResponse.data) ? rawResponse.data : [rawResponse.data];
            } else if (rawResponse.report_header || rawResponse.patient || rawResponse.findings) {
                // Direct report object
                reports = [rawResponse as ReportData];
            } else {
                // Try to use the whole response as a report
                console.warn("[OpenRad] Unexpected response format, attempting to use as report:", rawResponse);
                reports = [rawResponse as ReportData];
            }
        } else {
            throw new Error('Invalid response format from webhook');
        }

        console.log("[OpenRad] Parsed reports count:", reports.length);

        // Helper to normalize report_status from webhook to our known values
        const normalizeStatus = (status: string | undefined): ReportStatus => {
            if (!status) return 'Pending';
            const upper = status.toUpperCase().trim();
            if (upper === 'APPROVED') return 'Approved';
            if (upper === 'REJECTED') return 'Rejected';
            if (upper === 'FINAL') return 'Final';
            // Anything else (PRELIMINARY, DRAFT, PENDING, etc.) maps to Pending
            return 'Pending';
        };

        // Load profile info for report footer defaults
        let defaultPreparedBy = 'OpenRad AI';
        let defaultDepartment = 'Radiology';
        let defaultHospitalName = 'Hospital';
        if (typeof window !== 'undefined') {
            try {
                const savedProfile = localStorage.getItem("openrad_profile");
                if (savedProfile) {
                    const profile = JSON.parse(savedProfile);
                    if (profile.fullName) defaultPreparedBy = profile.fullName;
                    if (profile.department) defaultDepartment = profile.department;
                    if (profile.hospitalName) defaultHospitalName = profile.hospitalName;
                }
            } catch (e) { /* ignore */ }
        }

        // Ensure report has required structure with sensible defaults
        reports = reports.map(report => {
            const footer = report.report_footer || {};
            return {
                report_header: report.report_header || {
                    hospital_name: defaultHospitalName,
                    department: defaultDepartment,
                    report_title: 'Radiology Report',
                    report_id: `RAD-${Date.now()}`,
                    report_date: new Date().toISOString(),
                },
                patient: report.patient || { name: data.fullName, age: data.age, gender: data.gender },
                clinical_information: report.clinical_information || {
                    symptoms: data.symptoms,
                    history: data.history,
                    indication: data.indication,
                },
                study: report.study || { modality: data.modality, examination: `${data.modality} Scan`, views: 'Standard Views' },
                findings: report.findings || [],
                impression: report.impression || [],
                urgency: report.urgency || 'Routine',
                recommendations: report.recommendations || [],
                report_footer: {
                    prepared_by: footer.prepared_by || defaultPreparedBy,
                    department: footer.department || defaultDepartment,
                    report_status: normalizeStatus(footer.report_status),
                    approved_by: footer.approved_by,
                    approved_at: footer.approved_at,
                    signature: footer.signature,
                    rejection_reason: footer.rejection_reason,
                },
                disclaimer: report.disclaimer || 'This AI-generated report is for reference only and must be verified by a licensed radiologist.',
                image_data: report.image_data,
                collaboration: report.collaboration,
            };
        });

        // Attach image data to report before saving
        if (reports.length > 0 && imageBase64) {
            reports[0].image_data = imageBase64;
        }

        // Save the first report to Supabase
        if (reports.length > 0) {
            await saveReport(reports[0]);
        }

        return reports;
    } catch (error) {
        console.error("[OpenRad] Report generation error:", error);
        throw error;
    }
}

export async function saveReport(report: ReportData) {
    // 1. Save to localStorage first (always works, even offline)
    try {
        const localReports = JSON.parse(localStorage.getItem("openrad_reports") || "[]");
        const reportWithId = {
            id: `local_${Date.now()}`,
            patient_name: report.patient.name,
            modality: report.study.examination,
            urgency: report.urgency,
            report_data: report,
            created_at: new Date().toISOString()
        };
        localReports.push(reportWithId);
        localStorage.setItem("openrad_reports", JSON.stringify(localReports));
        console.log("Report saved to localStorage:", reportWithId.id);
    } catch (err) {
        console.error("Error saving to localStorage:", err);
    }

    // 2. Then save to Supabase (if configured)
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn("Supabase not configured. Report saved locally only.");
        return null;
    }

    try {
        const { data, error } = await supabase.from('reports').insert({
            patient_name: report.patient.name,
            modality: report.study.examination,
            urgency: report.urgency,
            report_data: report,
            created_at: new Date().toISOString()
        }).select();

        if (error) {
            console.error("Error saving report to Supabase:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });

            if (error.code === '42501') {
                console.warn("⚠️ PERMISSION DENIED: This is likely an RLS (Row Level Security) issue. Please run the SQL setup script in your Supabase dashboard to enable access.");
            }
            return null;
        }

        console.log("Report saved to Supabase:", data);
        return data;
    } catch (err) {
        console.error("Exception saving report to Supabase:", err);
        return null;
    }
}

export async function getReports() {
    // 1. Get reports from localStorage
    let localReports: any[] = [];
    try {
        localReports = JSON.parse(localStorage.getItem("openrad_reports") || "[]");
    } catch (err) {
        console.error("Error loading from localStorage:", err);
    }

    // 2. Get reports from Supabase
    const supabase = getSupabaseClient();
    let supabaseReports: any[] = [];

    if (supabase) {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching reports from Supabase:", error);
        } else {
            supabaseReports = data || [];
        }
    }

    // 3. Merge both sources (Supabase reports first, then local-only reports)
    // We must deduplicate because saveReport saves to BOTH places.
    // We prefer the Supabase version over the localStorage version if both exist.
    const allReports = [...supabaseReports];
    const existingIds = new Set(allReports.map(r => r.report_data?.report_header?.report_id || r.id));

    for (const local of localReports) {
        const localId = local.report_data?.report_header?.report_id || local.id;
        if (!existingIds.has(localId)) {
            allReports.push(local);
            existingIds.add(localId); // Just in case of duplicates within local
        }
    }

    console.log(`Loaded ${supabaseReports.length} from Supabase, ${localReports.length} from localStorage. Total deduplicated: ${allReports.length}`);

    return allReports;
}

export async function updateReportData(id: string, updates: Partial<ReportData>) {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { data: current, error: fetchError } = await supabase
        .from('reports')
        .select('report_data')
        .eq('id', id)
        .single();

    if (fetchError || !current) return false;

    const updatedData = { ...current.report_data, ...updates };

    const { error } = await supabase
        .from('reports')
        .update({ report_data: updatedData })
        .eq('id', id);

    return !error;
}

export async function updateReportStatus(
    id: string,
    status: ReportStatus,
    data?: { signature?: string, rejectionReason?: string, notes?: string }
) {
    const supabase = getSupabaseClient();

    // We will try Supabase first, but if it fails or is missing, we MUST continue to localStorage
    let updatedData: any = null;
    let supabaseSuccess = false;

    if (supabase) {
        // 1. Fetch current report data to preserve other fields
        const { data: current, error: fetchError } = await supabase
            .from('reports')
            .select('report_data')
            .eq('id', id)
            .single();

        if (!fetchError && current) {
            updatedData = { ...current.report_data };
            supabaseSuccess = true;
        }
    }

    // If we couldn't get data from Supabase, try to construct it or find it in local storage
    if (!updatedData) {
        try {
            const localReportsStr = localStorage.getItem("openrad_reports");
            if (localReportsStr) {
                const localReports = JSON.parse(localReportsStr);
                const localReport = localReports.find((r: any) => r.report_data?.report_header?.report_id === id || r.id === id);
                if (localReport) {
                    updatedData = { ...localReport.report_data };
                }
            }
        } catch (e) {
            console.error("Error reading local storage", e);
        }
    }

    // If perfectly new or nothing found, we can't update properly, but we should try to construct minimal update
    if (!updatedData) {
        // Fallback: This is risky but better than failing. 
        // Realistically, the caller 'report' object should support this, but we don't have it here.
        // We will assume the localStorage loop below will catch it.
    }

    if (updatedData) {
        updatedData.report_footer.report_status = status;

        // --- Logging & Comments Logic ---
        if (!updatedData.collaboration) {
            updatedData.collaboration = { comments: [], logs: [] };
        }

        const timestamp = new Date().toISOString();
        let userName = "System";
        let userRole = "System";

        if (typeof window !== 'undefined') {
            const savedProfile = localStorage.getItem("openrad_profile");
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                if (profile.fullName) userName = profile.fullName;
                if (profile.role) userRole = profile.role;
            }
        }

        // Add Audit Log
        updatedData.collaboration.logs.push({
            id: `log_${Date.now()}`,
            action: `Status Changed to ${status}`,
            user: userName,
            timestamp: timestamp,
            details: status === 'Rejected' ? `Reason: ${data?.rejectionReason}` :
                status === 'Approved' ? 'Report Approved' : 'Status reset'
        });

        // Add Comment (if notes or reason provided)
        if (data?.notes || data?.rejectionReason) {
            updatedData.collaboration.comments.push({
                id: `comment_${Date.now()}`,
                author: userName,
                role: userRole,
                text: data?.notes || data?.rejectionReason || "",
                timestamp: timestamp
            });
        }
        // -------------------------------

        // Handle Approval Data
        if (status === 'Approved') {
            updatedData.report_footer.approved_at = new Date().toISOString();
            if (data?.signature) updatedData.report_footer.signature = data.signature;
            updatedData.report_footer.approved_by = userName;
        }

        // Handle Rejection Data
        if (status === 'Rejected' && data?.rejectionReason) {
            updatedData.report_footer.rejection_reason = data.rejectionReason;
        }
    }


    // 2. Update the record in Supabase (if we have a client and success initially)
    let supabaseError = null;
    if (supabase && updatedData) {
        const { error } = await supabase
            .from('reports')
            .update({
                report_data: updatedData,
            })
            .eq('id', id);

        supabaseError = error;

        if (error) {
            console.error("Error updating report status in Supabase:", error);
        }
    }

    // 3. Update localStorage
    try {
        const localReportsStr = localStorage.getItem("openrad_reports");
        if (localReportsStr) {
            const localReports = JSON.parse(localReportsStr);
            const reportIdToMatch = updatedData?.report_header?.report_id || id;

            const index = localReports.findIndex((r: any) =>
                r.report_data?.report_header?.report_id === id ||
                r.id === id ||
                (reportIdToMatch && r.report_data?.report_header?.report_id === reportIdToMatch)
            );

            if (index !== -1) {
                // Update the deep property
                // Simplify: We always constructed updatedData above (either from DB or Local), so just use it.
                if (updatedData) {
                    localReports[index].report_data = updatedData;
                }

                // Sync urgency top-level
                if (localReports[index].report_data?.urgency) {
                    localReports[index].urgency = localReports[index].report_data.urgency;
                }

                localStorage.setItem("openrad_reports", JSON.stringify(localReports));
                console.log("Report status updated in localStorage");
                return true;
            }
        }
    } catch (err) {
        console.error("Error updating localStorage:", err);
    }

    // If we acted on Supabase, return based on that error. 
    // If we only acted on LocalStorage (implied by reaching here without returning true above, but actually the return true above handles the LS success case),
    // we should return false if we didn't find it in LS and didn't have Supabase.

    // However, if Supabase succeeded (supabaseError is null) or we skipped it, we might want to return true mostly to not block UI.
    // Ideally we returned true in the LS block if that worked.

    return !supabaseError;
}

export async function clearAllReports() {
    // 1. Clear localStorage
    try {
        localStorage.removeItem("openrad_reports");
        console.log("Cleared localStorage reports");
    } catch (e) {
        console.error("Error clearing localStorage:", e);
    }

    // 2. Clear Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
        const { error } = await supabase
            .from('reports')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows (neq a UUID that definitely doesn't exist or just use a dummy filter if needed, technically delete() without filters deletes all but Supabase prompts for it. Using neq id 0 is a safe way to say 'all')

        // Actually, Supabase delete() usually requires a filter. 
        // A common pattern to delete all is `.neq('id', 0)` or similar if ID is integer, or `.gt('id', '00000000-0000-0000-0000-000000000000')` for UUID.
        // Let's rely on client-side logic: if we want to clear board, we clear what we can.

        if (error) {
            console.error("Error clearing Supabase reports:", error);
            return false;
        }
    }

    return true;
}

function mockReportResponse(data: PatientContext): ReportData[] {
    // Try to load profile for mock data
    let footer: {
        prepared_by: string;
        department: string;
        report_status: ReportStatus; // Explicit type
        hospital_name: string;
    } = {
        prepared_by: "OpenRad AI",
        department: "Radiology",
        report_status: "Pending",
        hospital_name: "General Hospital"
    };

    if (typeof window !== 'undefined') {
        const savedProfile = localStorage.getItem("openrad_profile");
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            if (profile.fullName) footer.prepared_by = profile.fullName;
            if (profile.department) footer.department = profile.department;
            if (profile.hospitalName) footer.hospital_name = profile.hospitalName;
        }
    }

    return [
        {
            report_header: {
                hospital_name: footer.hospital_name,
                department: footer.department,
                report_title: "Radiology Report",
                report_id: `RAD-${Date.now()}`,
                report_date: new Date().toISOString(),
            },
            patient: {
                name: data.fullName,
                age: data.age,
                gender: data.gender,
            },
            clinical_information: {
                symptoms: data.symptoms,
                history: data.history,
                indication: data.indication,
            },
            study: {
                modality: data.modality,
                examination: `${data.modality} Scan`,
                views: "Standard Views",
            },
            findings: [
                {
                    anatomical_region: "Lungs",
                    observation: "Clear fields, no consolidation.",
                    status: "normal",
                },
                {
                    anatomical_region: "Heart",
                    observation: "Normal size and shape.",
                    status: "normal",
                },
            ],
            impression: [
                "Normal study.",
                "No acute abnormalities detected."
            ],
            urgency: "Routine",
            recommendations: [
                "Routine follow-up."
            ],
            report_footer: {
                prepared_by: footer.prepared_by,
                department: footer.department,
                report_status: footer.report_status,
            },
            disclaimer: "This AI-generated report is for reference only and must be verified by a licensed radiologist.",
        },
    ];
}
