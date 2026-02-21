"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from "@/components/ui/basic"
import { Save, User } from "lucide-react"

export default function ProfilePage() {
    const [profile, setProfile] = React.useState({
        fullName: "",
        role: "",
        hospitalName: "",
        department: ""
    });
    const [isSaved, setIsSaved] = React.useState(false);

    React.useEffect(() => {
        // Load from localStorage on mount
        const savedProfile = localStorage.getItem("openrad_profile");
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
        setIsSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem("openrad_profile", JSON.stringify(profile));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-text-heading">Your Profile</h2>
                <p className="text-text-secondary text-sm">Manage your professional details for report generation.</p>
            </div>

            <Card className="bg-bg-surface border-border-primary">
                <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex items-center gap-6 pb-6 border-b border-border-primary">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={40} />
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">{profile.fullName || "Your Name"}</h3>
                            <p className="text-text-muted">{profile.role || "Your Role"}</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={profile.fullName} onChange={handleChange} placeholder="Dr. John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" value={profile.role} onChange={handleChange} placeholder="Senior Radiologist" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hospitalName">Hospital / Clinic Name</Label>
                            <Input id="hospitalName" value={profile.hospitalName} onChange={handleChange} placeholder="General Medical Center" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" value={profile.department} onChange={handleChange} placeholder="Radiology" />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <Button onClick={handleSave} className="gap-2">
                            <Save size={16} /> Save Profile
                        </Button>
                        {isSaved && <span className="text-sm text-green-600 font-medium animate-in fade-in">Saved successfully!</span>}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
