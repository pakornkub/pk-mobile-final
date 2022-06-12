import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";
import theme from "../configs/theme";

import { store } from "../contexts/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const AppContainer: React.FC<any> = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <NavigationContainer>
          <NativeBaseProvider theme={theme}>
            {props.children}
          </NativeBaseProvider>
        </NavigationContainer>
      </Provider>
    </QueryClientProvider>
  );
};

export default AppContainer;
