import React, { useState, useEffect, useRef } from "react";
import {
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Box,
  Input,
  Icon,
  VStack,
  Button,
  useToast,
  FormControl,
  HStack,
  Text,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { DataTable } from "react-native-paper";

import { getDataFromQR } from "../../utils/qr";
import AppLoadingScreen from "../../components/AppLoadingScreen";
import AppScanner from "../../components/AppScanner";
import AppAlert from "../../components/AppAlert";

import { useCheckStock } from "../../hooks/useCheckStock";
import { useUpdateWHReceive } from "../../hooks/useWHReceive";

const WHReceive: React.FC = () => {
  const initItem = { QR_NO: "" };
  const initItems: any[] = [];
  const initErrors = {};

  const toast = useToast();

  const [camera, setCamera] = useState<boolean>(false);

  const [item, setItem] = useState<any>(initItem);
  const [items, setItems] = useState<any>(initItems);
  const [errors, setErrors] = useState<any>(initErrors);

  const [disabledButton, setDisabledButton] = useState<boolean>(true);

  const refInput = useRef<any>(null);
  const refScanner = useRef<boolean>(false);

  const {
    isLoading: itemIsLoading,
    status: itemStatus,
    error: itemError,
    data: itemData,
    refetch: itemRefetch,
  } = useCheckStock({
    QR_NO: item?.QR_NO || "",
  });

  const {
    isLoading: updateIsLoading,
    isError: updateIsError,
    status: updateStatus,
    error: updateError,
    mutate: updateMutate,
    data: updateData,
  } = useUpdateWHReceive();

  const handleScanner = (value: any) => {
    setCamera(false);

    if (!value) {
      return;
    }

    clearState("Error");

    const qr = getDataFromQR(value);

    setItem({
      ...item,
      QR_NO: qr?.QR_NO || "",
    });

    refScanner.current = true;
  };

  const handleSubmit = () => {
    updateMutate(items);
  };

  const calculateTotal = () => {
    if (parseInt(items.length) <= 10 && parseInt(items.length) > 0) {
      setDisabledButton(false);
    }
  };

  const validateErrors = () => {
    refScanner.current = false;

    if (!item.QR_NO) {
      setErrors({ ...errors, QR_NO: "Invalid QR format" });
      clearState("Item");
      return false;
    }

    if (
      !itemData.data.data.Location_ID ||
      parseInt(itemData.data.data.Location_ID) !== 2
    ) {
      setErrors({ ...errors, QR_NO: "Product not in Buffer WH" });
      clearState("Item");
      return false;
    }

    if (
      !itemData.data.data.Product_ID ||
      parseInt(itemData.data.data.Product_ID) !== 1
    ) {
      setErrors({ ...errors, QR_NO: "Product is not FG" });
      clearState("Item");
      return false;
    }

    if (
      !itemData.data.data.ItemStatus_ID ||
      parseInt(itemData.data.data.ItemStatus_ID) !== 4
    ) {
      setErrors({ ...errors, QR_NO: "Status product is not Approve" });
      clearState("Item");
      return false;
    }

    if (
      items.filter((value: any) => {
        return value.QR_NO === item.QR_NO;
      }).length > 0
    ) {
      setErrors({ ...errors, QR_NO: "QR No. this duplicate in list" });
      clearState("Item");
      return false;
    }

    if (parseInt(items.length) === 10) {
      setErrors({ ...errors, QR_NO: "Total completed can not scan" });
      clearState("Item");
      return false;
    }

    return true;
  };

  const clearState = (type: string) => {
    if (type === "All") {
      setItem(initItem);
      setItems(initItems);
      setErrors(initErrors);
      setDisabledButton(true);
    } else if (type === "Item") {
      setItem(initItem);
    } else if (type === "Items") {
      setItems(initItems);
    } else {
      setErrors(initErrors);
    }
  };

  useEffect(() => {
    itemRefetch();
    calculateTotal();
  }, [item]);

  useEffect(() => {
    if (!itemData) {
      return;
    }

    if (refScanner.current && validateErrors()) {
      let itemQR = { ...(itemData?.data?.data || {}) };

      let itemList = [...items];

      itemList.push(itemQR);

      setItems(itemList);

      clearState("Item");
    }
  }, [itemData]);

  useEffect(() => {
    if (updateStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert
            text={updateData?.data?.message || "success"}
            type="success"
          />
        ),
        placement: "top",
        duration: 2000,
      });
      clearState("All");
    } else if (updateStatus === "error") {
      toast.show({
        render: () => (
          <AppAlert
            text={updateError?.response?.data?.message || "error"}
            type="error"
          />
        ),
        placement: "top",
        duration: 3000,
      });
    }

    return () => {
      refScanner.current = false;
    };
  }, [updateStatus]);

  useEffect(() => {
    refInput?.current?.focus();
  });

  return (
    <>
      {!camera ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <AppLoadingScreen show={itemIsLoading || updateIsLoading} />
            <VStack space={10} p={5}>
              <FormControl isRequired isInvalid={"QR_NO" in errors}>
                <Input
                  h={50}
                  size={20}
                  ref={refInput}
                  showSoftInputOnFocus={false}
                  variant="underlined"
                  p={2}
                  placeholder="SCAN QR"
                  InputRightElement={
                    <Icon
                      size={25}
                      as={<MaterialIcons name="qr-code-scanner" />}
                      onPress={() => setCamera(true)}
                    />
                  }
                  autoFocus
                  value={item?.QR_NO || ""}
                  onChangeText={(value) => handleScanner(value)}
                />
                {"QR_NO" in errors && (
                  <FormControl.ErrorMessage>
                    {errors.QR_NO}
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ height: "50%" }}
              >
                <TouchableOpacity activeOpacity={1}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title style={{ maxWidth: "10%" }}>
                        NO.
                      </DataTable.Title>
                      <DataTable.Title>QR NO.</DataTable.Title>
                      <DataTable.Title>ITEM DESCRIPTION</DataTable.Title>
                    </DataTable.Header>
                    {items.length > 0 ? (
                      items.map((value: any, key: number) => {
                        return (
                          <DataTable.Row key={key}>
                            <DataTable.Title style={{ maxWidth: "10%" }}>
                              {key + 1}
                            </DataTable.Title>
                            <DataTable.Cell>{value.QR_NO}</DataTable.Cell>
                            <DataTable.Cell>
                              {value.ITEM_DESCRIPTION}
                            </DataTable.Cell>
                          </DataTable.Row>
                        );
                      })
                    ) : (
                      <DataTable.Row>
                        <DataTable.Title>No Data</DataTable.Title>
                      </DataTable.Row>
                    )}
                  </DataTable>
                </TouchableOpacity>
              </ScrollView>
              <HStack alignItems={"center"} justifyContent={"space-between"}>
                <Text fontSize={25}>{`RECEIVE`}</Text>
                <Text fontSize={25}>{`${items.length || 0}/10 TOTAL`}</Text>
              </HStack>
              <Button
                backgroundColor="green.600"
                leftIcon={
                  <Icon as={<MaterialIcons name="check" />} size="sm" />
                }
                isDisabled={disabledButton}
                onPress={handleSubmit}
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

export default WHReceive;
