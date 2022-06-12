import React, {useEffect} from "react";
import { VStack,Text } from "native-base";
import { useSelector } from "react-redux";

import { selectAuth } from "../../contexts/slices/authSlice";

const Main : React.FC = () => {

    const { authResult } = useSelector(selectAuth);

    console.log(authResult)

    return (<VStack>
        <Text>{authResult.data.EmpCode}</Text>
    </VStack>)
}

export default Main;