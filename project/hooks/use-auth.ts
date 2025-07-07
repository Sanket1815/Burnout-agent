// 'use client';

// import React,{ useState, useEffect, createContext, useContext, ReactNode } from 'react';
// // import { supabaseAdmin, dbHelpers } from '@/lib/supabase-server';
// import { User as SupabaseUser } from '@supabase/supabase-js';
// import { User } from '@/lib/types';

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (name: string, email: string, password: string) => Promise<void>;
//   loginWithGoogle: () => Promise<void>;
//   logout: () => Promise<void>;
//   refreshAuth: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Get initial session
//     supabaseAdmin.auth.getSession().then(({ data: { session } }) => {
//       if (session?.user) {
//         loadUserProfile(session.user);
//       } else {
//         setLoading(false);
//       }
//     });

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabaseAdmin.auth.onAuthStateChange(async (event, session) => {
//       if (session?.user) {
//         await loadUserProfile(session.user);
//       } else {
//         setUser(null);
//         setLoading(false);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const loadUserProfile = async (authUser: SupabaseUser) => {
//     try {
//       const userData = await dbHelpers.getUserById(authUser.id);
//       setUser({
//         id: userData.id,
//         email: userData.email,
//         name: userData.name,
//         avatar_url: userData.avatar_url,
//         created_at: userData.created_at,
//         settings: userData.settings as any || {
//           work_hours: { start: '09:00', end: '17:00', timezone: 'UTC' },
//           notifications: {
//             daily_analysis: true,
//             weekly_report: true,
//             burnout_alert: true,
//             recommendations: false
//           },
//           analysis: {
//             frequency: 'daily',
//             include_weekends: false,
//             sentiment_analysis: true,
//             email_analysis: true
//           }
//         }
//       });
//     } catch (error) {
//       console.error('Error loading user profile:', error);
//       // If user doesn't exist in our database, create them
//       if (authUser.email && authUser.user_metadata?.name) {
//         try {
//           const newUser = await dbHelpers.createUser({
//             email: authUser.email,
//             name: authUser.user_metadata.name,
//             avatar_url: authUser.user_metadata.avatar_url
//           });
//           setUser({
//             id: newUser.id,
//             email: newUser.email,
//             name: newUser.name,
//             avatar_url: newUser.avatar_url,
//             created_at: newUser.created_at,
//             settings: {
//               work_hours: { start: '09:00', end: '17:00', timezone: 'UTC' },
//               notifications: {
//                 daily_analysis: true,
//                 weekly_report: true,
//                 burnout_alert: true,
//                 recommendations: false
//               },
//               analysis: {
//                 frequency: 'daily',
//                 include_weekends: false,
//                 sentiment_analysis: true,
//                 email_analysis: true
//               }
//             }
//           });
//         } catch (createError) {
//           console.error('Error creating user profile:', createError);
//         }
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     const { error } = await supabaseAdmin.auth.signInWithPassword({
//       email,
//       password,
//     });
    
//     if (error) throw error;
//   };

//   const signup = async (name: string, email: string, password: string) => {
//     const { error } = await supabaseAdmin.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           name,
//         },
//       },
//     });
    
//     if (error) throw error;
//   };

//   const loginWithGoogle = async () => {
//     const { error } = await supabaseAdmin.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly',
//         redirectTo: `${window.location.origin}/dashboard`,
//       },
//     });
    
//     if (error) throw error;
//   };

//   const logout = async () => {
//     const { error } = await supabaseAdmin.auth.signOut();
//     if (error) throw error;
//     setUser(null);
//   };

//   const refreshAuth = async () => {
//     const { error } = await supabaseAdmin.auth.refreshSession();
//     if (error) throw error;
//   };

//   return React.createElement(
//     AuthContext.Provider,
//     {
//       value: {
//         user,
//         loading,
//         login,
//         signup,
//         loginWithGoogle,
//         logout,
//         refreshAuth,
//       },
//     },
//     children
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }