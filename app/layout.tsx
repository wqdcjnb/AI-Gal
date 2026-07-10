import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/auth-provider';
import { ProjectProvider } from '@/components/project/project-context';
import { MainNav } from '@/components/navbar/main-nav';

export const metadata: Metadata = {
  title: {
    default: 'AI-Gal',
    template: '%s | AI-Gal',
  },
  description: 'AI驱动的Galgame自动生成平台 - 从创意到Ren\'Py，一站式视觉小说创作',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ProjectProvider>
              <div className="flex min-h-screen flex-col">
                <MainNav />
                {/* Main Content */}
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
