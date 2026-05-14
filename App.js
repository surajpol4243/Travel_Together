import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { initializeDatabase } from './src/database/db';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
