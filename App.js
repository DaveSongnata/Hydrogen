import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import CustomIcon from './src/components/common/CustomIcon';
import PrimeiraExecucao from './src/components/PrimeiraExecucao';
import Home from './src/components/Home';
import CriarAtividade from './src/components/CriarAtividade';
import CriarAcao from './src/components/CriarAcao';
import EditarAcao from './src/components/EditarAcao';
import ReabastecerAgua from './src/components/ReabastecerAgua';
import { createTables } from './src/database/db';
import theme from './src/styles/theme';
import Graficos from './src/components/Graficos';

const Stack = createStackNavigator();

const App = () => {
  React.useEffect(() => {
    createTables();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="PrimeiraExecucao"
          screenOptions={({ navigation }) => ({
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={{ 
                  padding: 8,  // Área de toque maior
                  marginLeft: 8 
                }}
              >
                <CustomIcon 
                  name="back" 
                  size={24} 
                  color={theme.colors.surface}
                  style={{ 
                    resizeMode: 'contain'
                  }}
                />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Stack.Screen name="PrimeiraExecucao" component={PrimeiraExecucao} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerLeft: null }} />
          <Stack.Screen name="CriarAtividade" component={CriarAtividade} options={{ title: 'Nova Atividade' }} />
          <Stack.Screen name="CriarAcao" component={CriarAcao} options={{ title: 'Nova Ação' }} />
          <Stack.Screen name="EditarAcao" component={EditarAcao} options={{ title: 'Editar Ação' }} />
          <Stack.Screen name="ReabastecerAgua" component={ReabastecerAgua} options={{ title: 'Reabastecer Água' }} />
          <Stack.Screen name="Graficos" component={Graficos} options={{ title: 'Gráficos' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
