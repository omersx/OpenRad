import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "OpenRad - AI Radiology",
  description: "AI-powered radiology report generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const appearance = localStorage.getItem('openrad_appearance');
                if (appearance) {
                  const data = JSON.parse(appearance);
                  if (data.theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="flex flex-col md:flex-row h-screen overflow-hidden bg-bg-primary text-text-primary antialiased">
        <Header />
        <div className="hidden md:block z-50">
          <Sidebar />
        </div>
        <main className="flex-1 md:ml-20 h-full overflow-auto relative w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
