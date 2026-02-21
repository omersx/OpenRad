"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Badge } from "@/components/ui/basic"
import { MessageSquare, Send, Clock, User as UserIcon, Shield } from "lucide-react"
import { Comment, AuditLog } from "@/types"

interface CollaborationPanelProps {
    comments: Comment[];
    logs: AuditLog[];
    onAddComment: (text: string) => void;
    currentUser: { name: string, role: string };
}

export function CollaborationPanel({ comments, logs, onAddComment, currentUser }: CollaborationPanelProps) {
    const [activeTab, setActiveTab] = React.useState<'comments' | 'logs'>('comments');
    const [newComment, setNewComment] = React.useState("");

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment("");
    };

    return (
        <Card className="h-full flex flex-col bg-bg-panel border-l border-border-primary rounded-none border-y-0 border-r-0">
            <CardHeader className="p-4 border-b border-border-primary bg-bg-surface">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-sm uppercase text-text-muted">Collaboration</CardTitle>
                </div>
                <div className="flex gap-2 bg-bg-panel p-1 rounded-md">
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-sm transition-colors ${activeTab === 'comments' ? 'bg-bg-surface text-text-heading shadow-sm' : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        Comments ({comments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-sm transition-colors ${activeTab === 'logs' ? 'bg-bg-surface text-text-heading shadow-sm' : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        Audit Logs ({logs.length})
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">

                {activeTab === 'comments' ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {comments.length === 0 && (
                                <p className="text-center text-xs text-text-muted py-8">No comments yet. Start the conversation!</p>
                            )}
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-text-heading">{comment.author}</span>
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">{comment.role}</Badge>
                                        </div>
                                        <span className="text-[10px] text-text-muted">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="bg-bg-surface p-3 rounded-lg border border-border-primary text-sm text-text-primary shadow-sm">
                                        {comment.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-border-primary bg-bg-surface">
                            <div className="relative">
                                <Textarea
                                    placeholder="Type a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[80px] resize-none pr-10"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    className="absolute bottom-2 right-2 h-8 w-8"
                                    onClick={handleSubmit}
                                    disabled={!newComment.trim()}
                                >
                                    <Send size={14} />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {logs.length === 0 && (
                            <p className="text-center text-xs text-text-muted py-8">No specific logs record.</p>
                        )}
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 relative pb-4 last:pb-0">
                                {/* Timeline Line */}
                                <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border-primary last:hidden"></div>

                                <div className="z-10 mt-0.5">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${log.action.includes('Approved') ? 'bg-green-100 border-green-300 text-green-700' :
                                            log.action.includes('Rejected') ? 'bg-red-100 border-red-300 text-red-700' :
                                                'bg-bg-surface border-border-primary text-text-muted'
                                        }`}>
                                        {log.action.includes('Approved') ? <Shield size={12} /> :
                                            log.action.includes('Rejected') ? <Shield size={12} /> :
                                                <Clock size={12} />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-text-heading">{log.action}</p>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                                        <span className="flex items-center gap-1"><UserIcon size={10} /> {log.user}</span>
                                        <span>•</span>
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    {log.details && (
                                        <p className="mt-1 text-[11px] text-text-secondary italic">"{log.details}"</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
