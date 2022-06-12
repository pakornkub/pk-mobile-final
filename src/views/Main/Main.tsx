import React, { useEffect } from "react";
import { VStack, Text } from "native-base";
import { useSelector } from "react-redux";

import { selectAuth } from "../../contexts/slices/authSlice";

const Main: React.FC = () => {
  const { authResult } = useSelector(selectAuth);

  console.log(authResult);

  return (
    <VStack space={4} alignItems="center">
      {authResult?.data?.permission.map((value: any) => {
        return <Text key={value.Menu_Index}>{value.MenuName}</Text>;
      }) || <Text>Loading...</Text>}
    </VStack>
  );
};

export default Main;
