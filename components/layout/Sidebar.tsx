"use client"

import Image from 'next/image';
import { FileText, LayoutDashboard, Settings, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-bg-surface border-r border-border-primary flex flex-col items-center py-6 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="mb-8 relative w-16 h-16">
        <Image
          src="/logo.svg"
          alt="OpenRad Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      <nav className="flex-1 flex flex-col gap-3 w-full px-3">
        <NavItem
          href="/"
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={pathname === '/'}
        />
        <NavItem
          href="/reports"
          icon={FileText}
          label="Reports"
          isActive={pathname.startsWith('/reports')}
        />
        <NavItem
          href="/history"
          icon={Clock}
          label="History"
          isActive={pathname.startsWith('/history')}
        />
        <div className="flex-1" /> {/* Spacer */}
        <NavItem
          href="/settings"
          icon={Settings}
          label="Settings"
          isActive={pathname.startsWith('/settings')}
        />
        <NavItem
          href="/profile"
          icon={User}
          label="Profile"
          isActive={pathname.startsWith('/profile')}
        />
      </nav>

      <div className="mt-4 pb-6">
        {/* User Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
          <User size={20} />
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={`
        relative group flex items-center justify-center p-3 rounded-xl transition-all duration-300 ease-out
        ${isActive
          ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
          : 'text-text-muted hover:bg-primary/10 hover:text-primary hover:scale-105'
        }
      `}
      title={label}
    >
      <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'stroke-[2.5px]' : 'group-hover:stroke-[2.5px]'}`} />

      {/* Tooltip Label */}
      <span className="absolute left-16 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 shadow-xl z-50 whitespace-nowrap">
        {label}
        {/* Little arrow pointing left */}
        <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></span>
      </span>
    </Link>
  );
}
