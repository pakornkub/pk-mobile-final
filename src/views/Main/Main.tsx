import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, HStack, Pressable } from "native-base";
import { Alert } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setAuth, selectAuth } from "../../contexts/slices/authSlice";

import AppScanner from "../../components/AppScanner";
import { getCurrentTimeStamp } from "../../utils/date";
import { getTimeFromToken } from "../../utils/token";
import { expireTime } from "../../configs/token";

import ReceiveSP from "../../views/ReceiveSP";
import UnlockSP from "../../views/UnlockSP";
import ReceiveReturn from "../../views/ReceiveReturn";
import JobRepack from "../../views/JobRepack";
import JobRecheck from "../../views/JobRecheck";
import ShipToWH from "../../views/ShipToWH";
import WHReceive from "../../views/WHReceive";
import Withdraw from "../../views/Withdraw";
import CheckStock from "../../views/CheckStock";
import CountStock from "../../views/CountStock";

const Login = React.lazy(() => import("../Login"));
const Menu = React.lazy(() => import("../Menu"));

// const ReceiveSP = React.lazy(() => import("../ReceiveSP"));
// const UnlockSP = React.lazy(() => import("../UnlockSP"));
// const ReceiveReturn = React.lazy(() => import("../ReceiveReturn"));
// const CheckStock = React.lazy(() => import("../CheckStock"));

const Main: React.FC = () => {
  const Stack: any = createStackNavigator();
  const dispatch = useDispatch();
  const { authResult } = useSelector(selectAuth);

  const validateToken = useCallback(async () => {
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
  },[authResult]);

  const handleLogout = useCallback(() => {
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
  },[authResult]);

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
                  <HStack space={2} pr="2">
                    <Pressable onPress={() => handleLogout()}>
                      {({ isHovered, isPressed }) => {
                        return (
                          <Avatar
                            bg="primary.500"
                            size="sm"
                            mt={1}
                            color={
                              isPressed
                                ? "primary.700"
                                : isHovered
                                ? "primary.700"
                                : "primary.500"
                            }
                            style={{
                              transform: [
                                {
                                  scale: isPressed ? 0.96 : 1,
                                },
                              ],
                            }}
                          >
                            {authResult.data.UserName.charAt(0).toUpperCase()}
                            <Avatar.Badge bg="green.500" />
                          </Avatar>
                        );
                      }}
                    </Pressable>
                  </HStack>
                ),
              })}
            />
            <Stack.Screen name="ReceiveSP" component={ReceiveSP} />
            <Stack.Screen name="UnlockSP" component={UnlockSP} />
            <Stack.Screen name="ReceiveReturn" component={ReceiveReturn} />
            <Stack.Screen name="JobRepack" component={JobRepack} />
            <Stack.Screen name="JobRecheck" component={JobRecheck} />
            <Stack.Screen name="ShipToWH" component={ShipToWH} />
            <Stack.Screen name="WHReceive" component={WHReceive} />
            <Stack.Screen name="Withdraw" component={Withdraw} />
            <Stack.Screen name="CheckStock" component={CheckStock} />
            <Stack.Screen name="CountStock" component={CountStock} />
            <Stack.Screen name="AppScanner" component={AppScanner} />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={() => ({
              headerShown: false,
            })}
          />
        )}
      </Stack.Navigator>
    </>
  );
};

export default Main;
