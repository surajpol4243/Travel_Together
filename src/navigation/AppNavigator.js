import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ContributionScreen } from '../features/contributions/screens/ContributionScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { ExpenseScreen } from '../features/expenses/screens/ExpenseScreen';
import { FamilyListScreen } from '../features/families/screens/FamilyListScreen';
import { SettlementScreen } from '../features/settlements/screens/SettlementScreen';
import { TimelineScreen } from '../features/timeline/screens/TimelineScreen';
import { CreateTripScreen } from '../features/trips/screens/CreateTripScreen';
import { TripDetailsScreen } from '../features/trips/screens/TripDetailsScreen';
import { TripListScreen } from '../features/trips/screens/TripListScreen';
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
        name={ROUTES.TRIP_LIST}
        component={TripListScreen}
        options={{ title: 'Trips' }}
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
      <Stack.Screen
        name={ROUTES.FAMILIES}
        component={FamilyListScreen}
        options={{ title: 'Families' }}
      />
      <Stack.Screen
        name={ROUTES.CONTRIBUTIONS}
        component={ContributionScreen}
        options={{ title: 'Contributions' }}
      />
      <Stack.Screen
        name={ROUTES.EXPENSES}
        component={ExpenseScreen}
        options={{ title: 'Expenses' }}
      />
      <Stack.Screen
        name={ROUTES.SETTLEMENTS}
        component={SettlementScreen}
        options={{ title: 'Settlements' }}
      />
      <Stack.Screen
        name={ROUTES.TIMELINE}
        component={TimelineScreen}
        options={{ title: 'Timeline' }}
      />
    </Stack.Navigator>
  );
}
