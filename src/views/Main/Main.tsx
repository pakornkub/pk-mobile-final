import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Icon } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { Alert } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setAuth, selectAuth } from "../../contexts/slices/authSlice";

import AppScanner from "../../components/AppScanner";
import { getCurrentTimeStamp } from "../../utils/date";
import { expireTime } from "../../configs/token";
import { getTimeFromToken } from "../../utils/token";

const Login = React.lazy(() => import("../Login"));
const Menu = React.lazy(() => import("../Menu"));

const ReceiveSP = React.lazy(() => import("../ReceiveSP"));
const CheckStock = React.lazy(() => import("../CheckStock"));

const Main: React.FC = () => {
  const Stack: any = createStackNavigator();
  const dispatch = useDispatch();
  const { authResult } = useSelector(selectAuth);

  const validateToken = async () => {
    try {
      //? get token, status from AsyncStorage
      const auth: any = JSON.parse(
        (await AsyncStorage.getItem("auth")) || "{}"
      );

      if (auth.status) {
        const accessTime = getTimeFromToken(auth.data.token);
        const currentTime = getCurrentTimeStamp();

        //? if token is expired
        if (currentTime - accessTime > expireTime) {
          Alert.alert("Alert", "Your token is expired, please login again", [
            {
              text: "OK",
              onPress: () => {
                dispatch(setAuth({}));
              },
            },
          ]);
        }

        //? if token is valid
        dispatch(setAuth(auth));
      } else {
        dispatch(setAuth({}));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Alert",
      authResult?.data.UserName + " : Confirm Logout or Not ?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            dispatch(setAuth({}));
          },
        },
      ]
    );
  };

  useEffect(() => {
    validateToken();
  }, []);

  return (
    <>
      <Stack.Navigator>
        {authResult?.status ? (
          <>
            <Stack.Screen
              name="Menu"
              component={Menu}
              options={() => ({
                title: "Main",
                headerRight: () => (
                  <IconButton
                    _icon={{
                      as: MaterialIcons,
                      name: "logout",
                    }}
                    variant="ghost"
                    size="lg"
                    colorScheme="warning"
                    onPress={() => handleLogout()}
                  />
                ),
              })}
            />
            <Stack.Screen name="ReceiveSP" component={ReceiveSP} />
            <Stack.Screen name="CheckStock" component={CheckStock} />
            <Stack.Screen name="AppScanner" component={AppScanner} />
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </>
  );
};

export default Main;
