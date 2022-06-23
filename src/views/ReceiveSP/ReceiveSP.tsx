import React, { useState, useEffect, useRef } from "react";
import {
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Box, Input, Select, Icon, VStack, Button } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { DataTable } from "react-native-paper";

import AppLoadingScreen from "../../components/AppLoadingScreen";
import AppScanner from "../../components/AppScanner";

import { useReceiveSP, useReceiveSPItem } from "../../hooks/useReceiveSP";

const ReceiveSP: React.FC = () => {
  const [refresh, setRefresh] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [form, setForm] = useState<any>({});

  const disabledInput = useRef<boolean>(true);
  const focusInput = useRef<boolean>(false);

  const {
    isLoading: recIsLoading,
    isFetching,
    isError,
    data: recOrder,
    status,
    error,
  } = useReceiveSP();

  const {
    isLoading: itemIsLoading,
    data: recOrderItem,
    refetch,
  } = useReceiveSPItem({
    Order: form?.Order || "",
  });

  const handleScanner = (value: any) => {
    setForm({ ...form, QR: value });
    setCamera(false);
  };

  const handleChange = (Order: string, value: string) => {
    setForm({ ...form, [Order]: value });
    disabledInput.current = false;
    focusInput.current = true;
  };

  useEffect(() => {
    refetch();
  }, [form]);

  return (
    <>
      {!camera ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <AppLoadingScreen show={false} />
            <VStack space={10} p={5}>
              <Select
                width={"100%"}
                accessibilityLabel="Choose Service"
                placeholder="RECEIVE SP ORDER NO."
                onValueChange={(value) => handleChange("Order", value)}
              >
                {recOrder?.data?.data?.map((value: any) => {
                  return (
                    <Select.Item
                      key={value.Rec_ID}
                      shadow={2}
                      label={value.Rec_NO}
                      value={value.Rec_ID}
                    />
                  );
                })}
              </Select>
              <Input
                showSoftInputOnFocus={false}
                variant="underlined"
                p={2}
                placeholder="SCAN QR"
                InputRightElement={
                  <Icon
                    size={25}
                    as={<MaterialIcons name="qr-code-scanner" />}
                    onPress={() => setCamera(true)}
                    disabled={disabledInput.current}
                  />
                }
                isDisabled={disabledInput.current}
                isFocused={focusInput.current}
                value={form.QR}
                onChangeText={(text) => setForm({ ...form, QR: text })}
              />
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ height: "50%" }}
                refreshControl={
                  <RefreshControl
                    refreshing={itemIsLoading}
                    onRefresh={() => refetch()}
                  />
                }
              >
                <TouchableOpacity activeOpacity={1}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title style={{maxWidth:"10%"}}>NO.</DataTable.Title>
                      <DataTable.Title>SP</DataTable.Title>
                      <DataTable.Title numeric>LOCK</DataTable.Title>
                      <DataTable.Title numeric>TOTAL</DataTable.Title>
                    </DataTable.Header>
                    {recOrderItem?.data?.data?.map((value: any, key : number) => {
                      return (
                        <DataTable.Row key={key}>
                          <DataTable.Title style={{maxWidth:"10%"}}>{value.No}</DataTable.Title>
                          <DataTable.Cell>{value.SP}</DataTable.Cell>
                          <DataTable.Cell numeric>{value.Unlock}</DataTable.Cell>
                          <DataTable.Cell numeric>{value.Total}</DataTable.Cell>
                        </DataTable.Row>
                      );
                    }) || (
                      <DataTable.Row>
                        <DataTable.Title>No Data</DataTable.Title>
                      </DataTable.Row>
                    )}
                  </DataTable>
                </TouchableOpacity>
              </ScrollView>
              <Button
                backgroundColor="green.600"
                leftIcon={
                  <Icon as={<MaterialIcons name="check" />} size="sm" />
                }
                //onPress={handleSubmit}
              >
                SAVE
              </Button>
            </VStack>
          </Box>
        </TouchableWithoutFeedback>
      ) : (
        <AppScanner handleScanner={handleScanner} />
      )}
    </>
  );
};

export default ReceiveSP;
