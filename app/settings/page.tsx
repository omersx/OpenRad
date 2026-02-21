"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from "@/components/ui/basic"
import { Save, Trash2, AlertTriangle, Database } from "lucide-react"
import { UserManagementPanel } from "@/components/dashboard/UserManagementPanel"
import { AppearancePanel } from "@/components/dashboard/AppearancePanel"

export default function SettingsPage() {
    const [config, setConfig] = React.useState({
        n8nWebhookUrl: "",
        supabaseUrl: "",
        supabaseAnonKey: ""
    });
    const [isSaved, setIsSaved] = React.useState(false);

    React.useEffect(() => {
        // Load from localStorage on mount
        const savedConfig = localStorage.getItem("openrad_config");
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setConfig(prev => ({ ...prev, [id]: value }));
        setIsSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem("openrad_config", JSON.stringify(config));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleClearData = () => {
        if (confirm("⚠️ WARNING: This will permanently DELETE ALL REPORTS from your Local Device history.\n\nYour Supabase/Cloud reports will NOT be affected.\n\nAre you sure you want to proceed?")) {
            try {
                localStorage.removeItem("openrad_reports");
                alert("Local history has been cleared successfully.");
                window.location.reload();
            } catch (e) {
                console.error(e);
                alert("Failed to clear local data.");
            }
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-text-heading">Settings</h2>
                <p className="text-text-secondary text-sm">Configure API connections and integrations.</p>
            </div>

            {/* Appearance Settings */}
            <AppearancePanel />

            {/* API Configuration */}
            <Card className="bg-bg-surface border-border-primary">
                <CardHeader>
                    <CardTitle className="text-text-heading">API Configuration</CardTitle>
                    <p className="text-sm text-text-secondary">Configure n8n webhook and Supabase connection</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="n8nWebhookUrl" className="text-text-primary">n8n Webhook URL</Label>
                        <Input
                            id="n8nWebhookUrl"
                            type="url"
                            placeholder="https://your-n8n-instance.com/webhook/..."
                            value={config.n8nWebhookUrl}
                            onChange={handleChange}
                            className="mt-1 bg-bg-panel border-border-primary text-text-primary placeholder-text-muted"
                        />
                    </div>

                    <div>
                        <Label htmlFor="supabaseUrl" className="text-text-primary">Supabase URL</Label>
                        <Input
                            id="supabaseUrl"
                            type="url"
                            placeholder="https://your-project.supabase.co"
                            value={config.supabaseUrl}
                            onChange={handleChange}
                            className="mt-1 bg-bg-panel border-border-primary text-text-primary placeholder-text-muted"
                        />
                    </div>

                    <div>
                        <Label htmlFor="supabaseAnonKey" className="text-text-primary">Supabase Anon Key</Label>
                        <Input
                            id="supabaseAnonKey"
                            type="password"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            value={config.supabaseAnonKey}
                            onChange={handleChange}
                            className="mt-1 bg-bg-panel border-border-primary text-text-primary placeholder-text-muted"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        className="w-full mt-4 bg-primary-main hover:bg-primary-hover text-white gap-2"
                    >
                        <Save size={16} />
                        {isSaved ? "Saved!" : "Save Configuration"}
                    </Button>
                </CardContent>
            </Card>

            {/* User Management */}
            <UserManagementPanel />

            {/* Database Management */}
            <Card className="bg-bg-surface border-border-primary border-t-4 border-t-red-500">
                <CardHeader>
                    <CardTitle className="text-text-heading flex items-center gap-2">
                        <Database size={20} className="text-red-500" />
                        Database Management
                    </CardTitle>
                    <p className="text-sm text-text-secondary">Manage your report storage and history.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-800">
                        <AlertTriangle className="shrink-0 w-5 h-5" />
                        <div className="space-y-1">
                            <p className="font-semibold text-sm">Clear Local History</p>
                            <p className="text-xs opacity-90">This will remove all reports from your Local Storage ONLY. Cloud data will remain safe.</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleClearData}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        Clear Local Report History
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
