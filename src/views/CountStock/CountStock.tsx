import React, { useState, useEffect, useRef } from "react";
import {
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Box,
  Input,
  Select,
  Icon,
  VStack,
  Button,
  useToast,
  FormControl,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { DataTable } from "react-native-paper";

import { getDataFromQR } from "../../utils/qr";
import AppLoadingScreen from "../../components/AppLoadingScreen";
import AppScanner from "../../components/AppScanner";
import AppAlert from "../../components/AppAlert";

import {
  useCountStock,
  useCountStockItem,
  useCreateCountStockItem,
  useUpdateCountStock,
} from "../../hooks/useCountStock";

const CountStock: React.FC = () => {
  const initOrder = { CountStock_ID: "" };
  const initItem = { QR_NO: "", Tag_ID: "" };
  const initErrors = {};

  const toast = useToast();

  const [camera, setCamera] = useState<boolean>(false);

  const [order, setOrder] = useState<any>(initOrder);
  const [item, setItem] = useState<any>(initItem);
  const [errors, setErrors] = useState<any>(initErrors);

  const [disabledButton, setDisabledButton] = useState<boolean>(true);

  const refInput = useRef<any>(null);
  const refScanner = useRef<boolean>(false);

  const {
    isLoading: orderIsLoading,
    isFetching,
    isError,
    data: orderData,
    status,
    error,
  } = useCountStock();

  const {
    isLoading: itemIsLoading,
    data: itemData,
    refetch: itemRefetch,
  } = useCountStockItem({
    CountStock_ID: order?.CountStock_ID || "",
  });

  const {
    isLoading: createIsLoading,
    isError: createIsError,
    status: createStatus,
    error: createError,
    mutate: createMutate,
    data: createData,
  } = useCreateCountStockItem();

  const {
    isLoading: updateIsLoading,
    isError: updateIsError,
    status: updateStatus,
    error: updateError,
    mutate: updateMutate,
    data: updateData,
  } = useUpdateCountStock();

  const handleChangeOrder = (value: string) => {
    if (!value) {
      return;
    }

    clearState("Error");

    setOrder({ ...order, CountStock_ID: value });
  };

  const handleScanner = (value: any) => {
    setCamera(false);

    if (!value) {
      return;
    }

    clearState("Error");

    const qr = getDataFromQR(value);

    setItem({ ...qr, QR_NO: qr?.QR_NO || "", Tag_ID: qr?.Tag_ID || "" });

    refScanner.current = true;
  };

  const handleSubmit = () => {
    updateMutate(order);
  };

  const calculateTotal = () => {
    const sumLock =
      itemData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.Lock);
      }, 0) || 0;

    const sumTotal =
      itemData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.Total);
      }, 0) || 0;

    if (parseInt(sumLock) === parseInt(sumTotal) && parseInt(sumLock) !== 0) {
      setDisabledButton(false);
    }
  };

  const validateErrors = () => {
    refScanner.current = false;

    if (!order.CountStock_ID) {
      setErrors({ ...errors, CountStock_ID: "Receive Order is required" });
      clearState("Item");
      return false;
    }

    if (!item.QR_NO || !item.Tag_ID) {
      setErrors({ ...errors, QR_NO: "Invalid QR format" });
      clearState("Item");
      return false;
    }

    return true;
  };

  const clearState = (type: string) => {
    if (type === "All") {
      setOrder(initOrder);
      setItem(initItem);
      setErrors(initErrors);
      setDisabledButton(true);
    } else if (type === "Item") {
      setItem(initItem);
    } else if (type === "Order") {
      setOrder(initOrder);
    } else {
      setErrors(initErrors);
    }
  };

  useEffect(() => {
    itemRefetch();
  }, [order]);

  useEffect(() => {
    if (refScanner.current) {
      validateErrors() && createMutate({ ...order, ...item });
    }
  }, [item]);

  useEffect(() => {
    calculateTotal();
  }, [itemData]);

  useEffect(() => {
    if (createStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert
            text={createData?.data?.message || "success"}
            type="success"
          />
        ),
        placement: "top",
        duration: 2000,
      });
 
    } else if (createStatus === "error") {
      toast.show({
        render: () => (
          <AppAlert
            text={createError?.response?.data?.message || "error"}
            type="error"
          />
        ),
        placement: "top",
        duration: 3000,
      });
    }

    return () => {
      refScanner.current = false;
      clearState("Item");
    };

  }, [createStatus]);

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
            <AppLoadingScreen show={updateIsLoading || createIsLoading} />
            <VStack space={10} p={5}>
              <FormControl isRequired isInvalid={"CountStock_ID" in errors}>
                <Select
                  h={50}
                  size={20}
                  width={"100%"}
                  accessibilityLabel="Choose Service"
                  placeholder="RECEIVE SP ORDER NO."
                  selectedValue={order?.CountStock_ID || ""}
                  onValueChange={(value) => handleChangeOrder(value)}
                >
                  {orderData?.data?.data?.map((value: any) => {
                    return (
                      <Select.Item
                        key={value.CountStock_ID}
                        shadow={2}
                        label={value.Rec_NO}
                        value={value.CountStock_ID}
                      />
                    );
                  })}
                </Select>
                {"CountStock_ID" in errors && (
                  <FormControl.ErrorMessage>
                    {errors.CountStock_ID}
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
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
                refreshControl={
                  <RefreshControl
                    refreshing={itemIsLoading}
                    onRefresh={() => itemRefetch()}
                  />
                }
              >
                <TouchableOpacity activeOpacity={1}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title style={{ maxWidth: "10%" }}>
                        NO.
                      </DataTable.Title>
                      <DataTable.Title>SP</DataTable.Title>
                      <DataTable.Title numeric>LOCK</DataTable.Title>
                      <DataTable.Title numeric>TOTAL</DataTable.Title>
                    </DataTable.Header>
                    {itemData?.data?.data?.map((value: any, key: number) => {
                      return (
                        <DataTable.Row key={key}>
                          <DataTable.Title style={{ maxWidth: "10%" }}>
                            {value.No}
                          </DataTable.Title>
                          <DataTable.Cell>{value.SP}</DataTable.Cell>
                          <DataTable.Cell numeric>{value.Lock}</DataTable.Cell>
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

export default CountStock;
