import React from "react";
import { Container } from "native-base";
import { useSelector } from "react-redux";

import { selectAuth } from "../../contexts/slices/authSlice";

import ListMenu from "./ListMenu";

const Menu: React.FC<any> = ({navigation}) => {
  
  const { authResult } = useSelector(selectAuth);

  return (
    <Container h="100%">
      <ListMenu items={authResult?.data?.permission} col={2} navigation={navigation} />
    </Container>
  );
};

export default Menu;
