import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/auth/auth-provider';
import { NavClient } from '@/components/navbar/nav-client';

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
            <div className="flex min-h-screen flex-col">
              <NavClient />
              <main className="flex-1">
                {children}
              </main>
              <footer className="border-t bg-card py-6">
                <div className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-sm text-muted-foreground">
                  <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    新ICP备2026005748号
                  </a>
                  <a href="https://www.beian.gov.cn/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                    <img src="https://www.beian.gov.cn/img/ghs.png" alt="" className="h-4 w-4 inline-block" />
                    兵公网安备66080002000195号
                  </a>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
