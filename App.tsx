import { createStackNavigator } from "@react-navigation/stack";
import AppContainer from "./src/components/AppContainer";

import Login from "./src/views/Login/";
import Main from "./src/views/Main/";

const App: React.FC = () => {
  const Stack: any = createStackNavigator();

  return (
    <AppContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Main" component={Main} />
      </Stack.Navigator>
    </AppContainer>
  );
};

export default App;
