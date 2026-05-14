import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { CreateTripScreen } from '../features/trips/screens/CreateTripScreen';
import { TripDetailsScreen } from '../features/trips/screens/TripDetailsScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.DASHBOARD}
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name={ROUTES.DASHBOARD}
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name={ROUTES.CREATE_TRIP}
        component={CreateTripScreen}
        options={{ title: 'Create Trip' }}
      />
      <Stack.Screen
        name={ROUTES.TRIP_DETAILS}
        component={TripDetailsScreen}
        options={{ title: 'Trip Details' }}
      />
    </Stack.Navigator>
  );
}
