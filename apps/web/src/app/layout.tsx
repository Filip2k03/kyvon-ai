import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export const metadata = {
  title: 'KYVON AI — Intelligent AI Workspace & Operating System',
  description: 'AI + Memory + Knowledge + Tools + Agents + Automation for Developers and Creators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090A0F] text-slate-100 min-h-screen">
        <Sidebar />
        <div className="pl-64 flex flex-col min-h-screen">
          <TopBar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
