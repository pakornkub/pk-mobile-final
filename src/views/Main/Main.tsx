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

import { DynamicMenu } from "../../components/DynamicMenu";

const Login = React.lazy(() => import("../Login"));
const Menu = React.lazy(() => import("../Menu"));
const Error404 = React.lazy(() => import("../Error404"));

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
  }, [authResult]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "CONFIRM LOGOUT",
      authResult?.data.UserName + " : Confirm logout or not ?",
      [
        {
          text: "CANCEL",
          style: "cancel",
        },
        {
          text: "CONFIRM",
          style: "default",
          onPress: () => {
            dispatch(setAuth({}));
          },
        },
      ]
    );
  }, [authResult]);

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
                title: "MAIN",
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

            {authResult?.data?.permission?.map((value: any, index: number) => {
              return (
                <Stack.Screen
                  key={index}
                  name={value.MenuId}
                  options={() => ({
                    title: `${value.MenuName.toUpperCase()}`,
                    headerStyle: {
                      backgroundColor: "#2471A3",
                    },
                    headerTitleStyle: {
                      color: "#FDFEFE",
                    },
                    headerTintColor: "#FDFEFE",
                  })}
                  component={DynamicMenu[value.MenuId] ? DynamicMenu[value.MenuId] : Error404}
                />
              );
            })}

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
