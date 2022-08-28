import React from "react";
import { Text, Icon, HStack, Box, Divider } from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Logo = () => {
  return (
    <>
      <HStack space={1}>
        <Icon
          color={"blue.700"}
          as={<MaterialCommunityIcons name="package-variant" />}
          size="8"
        />
        <HStack>
          <Text fontSize={20} bold>
            REPACK
          </Text>
          <HStack alignItems={"center"}>
            <Divider orientation="vertical" mx="2" thickness="2" h={5} />
            <Text fontSize={15} bold color="gray.400">
              SYSTEM
            </Text>
          </HStack>
        </HStack>
      </HStack>
    </>
  );
};

export default Logo;
