import React, { useState, useEffect } from "react";
import {
  FormControl,
  VStack,
  Input,
  Icon,
  Button,
  Text,
  Center,
  Box,
  useToast,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

import { useAuthLogin } from "../../hooks/useLogin";

import { IAuthLoginParams } from "../../types/views/Login";

import AppAlert from "../../components/AppAlert";
import AppLoadingScreen from "../../components/AppLoadingScreen";
import Logo from "../../assets/toto.svg";

const Login: React.FC = () => {
  const toast = useToast();

  const { isLoading, isError, error, status, mutate } = useAuthLogin();
  const [show, setShow] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});
  const [form, setForm] = useState<IAuthLoginParams>({
    username: "pakorn.wo",
    password: "1234",
  });

  const handleSubmit = () => {
    validateLogin() && mutate(form);
  };

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });

    let err = { ...errors };
    delete err[name];

    setErrors(err);
  };

  const validateLogin = () => {
    if (!form.username) {
      setErrors({ ...errors, username: "Username is required" });
      return false;
    }
    if (!form.password) {
      setErrors({ ...errors, password: "Password is required" });
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (status === "success") {
    } else if (status === "error") {
      toast.show({
        render: () => {
          return (
            <AppAlert text={error?.response?.data?.message} type="error"/>
          );
        },
        placement: "top",
      });

      console.log(error?.response?.data?.message);
    }

    return () => {};
  }, [status]);

  return (
    <Box flex={1} safeArea>
      <AppLoadingScreen show={isLoading} />
      <Center mt="10%">
        <Logo width={250} height={120} />
      </Center>
      <Box p={5}>
        <VStack
          space={5}
          p={10}
          backgroundColor="coolGray.200"
          borderRadius="xl"
        >
          <Center>
            <Text fontWeight="bold" color="coolGray.500">
              REPACK SYSTEM
            </Text>
          </Center>
          <FormControl isRequired isInvalid={"username" in errors}>
            <Input
              InputLeftElement={
                <Icon as={<MaterialIcons name="person" />} size="md" />
              }
              variant="underlined"
              p={2}
              placeholder="Username"
              value={form.username}
              onChangeText={(text) => handleChange("username", text)}
            />
            {"username" in errors && (
              <FormControl.ErrorMessage>
                {errors.username}
              </FormControl.ErrorMessage>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={"password" in errors}>
            <Input
              InputLeftElement={
                <Icon as={<MaterialIcons name="lock" />} size="md" />
              }
              variant="underlined"
              p={2}
              type={show ? "text" : "password"}
              placeholder="Password"
              InputRightElement={
                <Icon
                  size="md"
                  color={show ? "blue.500" : "coolGray.500"}
                  as={
                    <MaterialIcons
                      name={show ? "visibility" : "visibility-off"}
                    />
                  }
                  onPress={() => setShow(!show)}
                />
              }
              value={form.password}
              onChangeText={(text) => handleChange("password", text)}
            />
            {"password" in errors && (
              <FormControl.ErrorMessage>
                {errors.password}
              </FormControl.ErrorMessage>
            )}
          </FormControl>
          <Button
            leftIcon={<Icon as={<MaterialIcons name="login" />} size="sm" />}
            onPress={handleSubmit}
          >
            SIGN IN
          </Button>
        </VStack>
      </Box>
      <Center flex={1}>
        <Text>V 1.0</Text>
      </Center>
    </Box>
  );
};

export default Login;
