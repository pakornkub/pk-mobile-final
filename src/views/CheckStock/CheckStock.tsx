import React from "react";
import { Container } from "native-base";
import { useSelector } from "react-redux";

import { selectAuth } from "../../contexts/slices/authSlice";

const CheckStock: React.FC = () => {
  
  const { authResult } = useSelector(selectAuth);

  return (
    <Container h="100%">
      
    </Container>
  );
};

export default CheckStock;
