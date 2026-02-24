"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Badge } from "@/components/ui/basic"
import { Trash2, UserPlus, User } from "lucide-react"

interface User {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Doctor" | "Nurse" | "Technician" | "Other";
    active: boolean;
}

export function UserManagementPanel() {
    const [users, setUsers] = React.useState<User[]>([]);
    const [newUser, setNewUser] = React.useState({
        name: "",
        email: "",
        role: "Doctor" as const
    });

    React.useEffect(() => {
        const savedUsers = localStorage.getItem("openrad_users");
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        } else {
            // Seed with some dummy data if empty
            const initialUsers: User[] = [
                { id: "1", name: "Admin User", email: "admin@openrad.app", role: "Admin", active: true },
                { id: "2", name: "Dr. Sarah Chen", email: "sarah.chen@hospital.com", role: "Doctor", active: true },
            ];
            setUsers(initialUsers);
            localStorage.setItem("openrad_users", JSON.stringify(initialUsers));
        }
    }, []);

    const saveUsers = (updatedUsers: User[]) => {
        setUsers(updatedUsers);
        localStorage.setItem("openrad_users", JSON.stringify(updatedUsers));
    };

    const handleAddUser = () => {
        if (!newUser.name || !newUser.email) return;
        const user: User = {
            id: Date.now().toString(),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            active: true
        };
        saveUsers([...users, user]);
        setNewUser({ name: "", email: "", role: "Doctor" });
    };

    const handleRemoveUser = (id: string) => {
        if (confirm("Are you sure you want to remove this user?")) {
            saveUsers(users.filter(u => u.id !== id));
        }
    };

    const toggleStatus = (id: string) => {
        saveUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
    };

    return (
        <Card className="bg-bg-surface border-border-primary">
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Add User Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-bg-panel/50 p-4 rounded-lg border border-border-primary">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border-primary bg-bg-panel px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                        >
                            <option value="Admin">Admin</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Nurse">Nurse</option>
                            <option value="Technician">Technician</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <Button onClick={handleAddUser} className="bg-primary hover:bg-primary-hover text-white">
                        <UserPlus size={16} className="mr-2" /> Add User
                    </Button>
                </div>

                {/* Users List */}
                <div className="rounded-md border border-border-primary overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-bg-panel text-text-secondary border-b border-border-primary">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-primary">
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-text-muted">No users found.</td>
                                </tr>
                            )}
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-bg-panel/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-text-heading">{user.name}</div>
                                        <div className="text-xs text-text-muted">{user.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-text-primary border-border-primary">
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggleStatus(user.id)} className="flex items-center gap-1.5 focus:outline-none">
                                            <div className={`h-2 w-2 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className={user.active ? 'text-green-500' : 'text-red-500'}>
                                                {user.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
                                            onClick={() => handleRemoveUser(user.id)}
                                        >
                                            <Trash2 size={14} /> {/* No text, just icon for compactness */}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </CardContent>
        </Card>
    )
}
