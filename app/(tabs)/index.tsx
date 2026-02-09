import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DailyChallenge from '../../components/DailyChallenge';
import Loading from '../../components/Loading';


export default function HomeScreen() {
  const { session, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!session) {
        router.replace('/(auth)/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [session, loading]);

  if (isLoading) {
    return <Loading onLoadingComplete={() => {}} />;
  }

  return (
    <View style={styles.container}>
      <DailyChallenge />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
});
