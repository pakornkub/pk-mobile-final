import { createStackNavigator } from "@react-navigation/stack";

import Login from "../Login";
import Menu from "../Menu";
import CheckStock from "../CheckStock";

const Main: React.FC = () => {
  
  const Stack: any = createStackNavigator();

  return (
    <>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="CheckStock" component={CheckStock} />
      </Stack.Navigator>
      </>
  );
};

export default Main;
