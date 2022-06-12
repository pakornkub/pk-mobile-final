import React, { useState, useEffect } from "react";
import { FormControl, VStack, Input, Icon, Button, Text } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuthLogin } from "../../hooks/useLogin";

import { IAuthLoginParams } from "../../types/views/Login";

import Logo from "../../assets/toto.svg";

const Login: React.FC<any> = ({ navigation }) => {
  const { isLoading, isError, error, status, mutate } = useAuthLogin();
  const [show, setShow] = useState<boolean>(false);
  const [form, setForm] = useState<IAuthLoginParams>({
    username: "pakorn.wo",
    password: "1234",
  });

  const handleChange = (text: string, name: string) => {
    setForm({ ...form, [name]: text });
  };

  const handleSubmit = () => {
    mutate(form);
  };

  const validateToken = async () => {
    try {
      //? get token from AsyncStorage
      const token = await AsyncStorage.getItem("accessToken");
      console.log(token);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (status === "success") {
      navigation.navigate("Main");
    } else if (status === "error") {
      console.log(status);
    }

    return () => {};
  }, [status]);

  useEffect(() => {
    validateToken();
  }, []);

  return (
    <FormControl isRequired isInvalid>
      <VStack space={5} p={10}>
        <Logo width={120} height={40} />
        <Input
          InputLeftElement={
            <Icon as={<MaterialIcons name="person" />} size="md" m={2} />
          }
          variant="underlined"
          p={2}
          placeholder="Username"
          value={form.username}
          onChangeText={(text) => handleChange(text, "username")}
        />
        <FormControl.ErrorMessage display="none">
          Something is wrong.
        </FormControl.ErrorMessage>
        <Input
          InputLeftElement={
            <Icon as={<MaterialIcons name="lock" />} size="md" m={2} />
          }
          variant="underlined"
          p={2}
          type={show ? "text" : "password"}
          placeholder="Password"
          InputRightElement={
            <Icon
              as={
                <MaterialIcons
                  name={show ? "visibility" : "visibility-off"}
                  onPress={() => setShow(!show)}
                />
              }
            />
          }
          value={form.password}
          onChangeText={(text) => handleChange(text, "password")}
        />
        <FormControl.ErrorMessage display="none">
          Something is wrong.
        </FormControl.ErrorMessage>
        <Button
          leftIcon={<Icon as={<MaterialIcons name="login" />} size="sm" />}
          onPress={handleSubmit}
        >
          SIGN IN
        </Button>
        <Text>V 1.0</Text>
      </VStack>
    </FormControl>
  );
};

export default Login;
