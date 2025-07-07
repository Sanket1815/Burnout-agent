@@ .. @@
 import { ThemeProvider } from 'next-themes';
-import { AuthProvider } from '../hooks/AuthContext';
+import { AuthProvider } from '@/hooks/use-auth';
 
 export function Providers({ children }: { children: React.ReactNode }) {
 }