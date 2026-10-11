import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RouteGate() {
  const { session, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const first = segments[0] as string | undefined;
  const publicRoute = !first || first === 'index' || first === 'login' || first === 'register';

  useEffect(() => {
    if (loading) return;
    if (!session && !publicRoute) router.replace('/login');
    else if (session && role && (first === 'login' || first === 'register' || first === 'index')) router.replace('/dashboard');
    else if (session && !role && !publicRoute) router.replace('/login');
  }, [loading, session, role, publicRoute, first, router]);

  if (loading && !publicRoute) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <AuthProvider><RouteGate /></AuthProvider>;
}
