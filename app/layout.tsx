@@ .. @@
 import { Inter } from 'next/font/google';
 import { Providers } from '@/components/providers';
 import { Toaster } from '@/components/ui/sonner';
+import '@/lib/init-db';
 
 const inter = Inter({ subsets: ['latin'] });