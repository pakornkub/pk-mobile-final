import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "react-query";
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
  Text,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { DataTable } from "react-native-paper";

import { getDataFromQR } from "../../utils/qr";
import LoadingScreen from "../../components/LoadingScreen";
import AppScanner from "../../components/AppScanner";
import AppAlert from "../../components/AppAlert";

import { useReceiveSPItem } from "../../hooks/useReceiveSP";

import {
  useUnlockSP,
  useUpdateUnlockSP,
  useExecUnlockSPTag,
} from "../../hooks/useUnlockSP";

import { styles } from "../styles";

const UnlockSP: React.FC = () => {
  const initOrder = { Rec_ID: "" };
  const initItem = { QR_NO: "", Tag_ID: "" };
  const initErrors = {};

  const toast = useToast();
  const queryClient = useQueryClient();

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
    refetch: orderRefetch,
    status,
    error,
  } = useUnlockSP();

  const {
    isLoading: itemIsLoading,
    data: itemData,
    refetch: itemRefetch,
  } = useReceiveSPItem({
    Rec_ID: order?.Rec_ID || "",
  });

  const {
    isLoading: updateIsLoading,
    isError: updateIsError,
    status: updateStatus,
    error: updateError,
    mutate: updateMutate,
    data: updateData,
  } = useUpdateUnlockSP();

  const {
    isLoading: tagIsLoading,
    isError: tagIsError,
    status: tagStatus,
    error: tagError,
    mutate: tagMutate,
    data: tagData,
  } = useExecUnlockSPTag();

  const handleChangeOrder = (value: string) => {
    if (!value) {
      return;
    }

    clearState("Error");

    setOrder({ ...order, Rec_ID: value });
  };

  const handleScanner = (value: any) => {
    setCamera(false);

    if (!value) {
      return;
    }

    clearState("Error");

    const qr = getDataFromQR(value);

    setItem({ ...item, QR_NO: qr?.QR_NO || "", Tag_ID: qr?.Tag_ID || "" });

    refScanner.current = true;
  };

  const handleSubmit = () => {
    updateMutate(order);
  };

  const calculateTotal = () => {
    const sumUnlock =
      itemData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.Unlock);
      }, 0) || 0;

    const sumTotal =
      itemData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.Total);
      }, 0) || 0;

    if (
      parseInt(sumUnlock) === parseInt(sumTotal) &&
      parseInt(sumUnlock) !== 0
    ) {
      setDisabledButton(false);
    }
  };

  const validateErrors = () => {
    refScanner.current = false;

    if (!order.Rec_ID) {
      setErrors({ ...errors, Rec_ID: "Receive Order is required" });
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
    if (refScanner.current && validateErrors()) {
      tagMutate({ ...order, ...item });
    }
  }, [item]);

  useEffect(() => {
    calculateTotal();
  }, [itemData]);

  useEffect(() => {
    if (tagStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert text={tagData?.data?.message || "success"} type="success" />
        ),
        placement: "top",
        duration: 2000,
      });
    } else if (tagStatus === "error") {
      toast.show({
        render: () => (
          <AppAlert
            text={tagError?.response?.data?.message || "error"}
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
  }, [tagStatus]);

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

  useEffect(() => {
    return () => {
      clearState("All");
      queryClient.clear();
    };
  }, []);

  return (
    <>
      {!camera ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <LoadingScreen show={updateIsLoading || tagIsLoading} />
            <VStack space={10} p={5}>
              <FormControl isRequired isInvalid={"Rec_ID" in errors}>
                <Select
                  h={50}
                  size={20}
                  width={"100%"}
                  placeholder="RECEIVE PART ORDER NO."
                  selectedValue={order?.Rec_ID || ""}
                  onValueChange={(value) => handleChangeOrder(value)}
                >
                  {orderData?.data?.data?.map((value: any) => {
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
                {"Rec_ID" in errors && (
                  <FormControl.ErrorMessage>
                    {errors.Rec_ID}
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
                      size={35}
                      color={"primary.600"}
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
                    onRefresh={() => orderRefetch()}
                  />
                }
              >
                <TouchableOpacity activeOpacity={1}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title style={styles.table_title_10}>
                        <Text bold>NO.</Text>
                      </DataTable.Title>
                      <DataTable.Title style={styles.table_title_52}>
                        <Text bold>PART</Text>
                      </DataTable.Title>
                      <DataTable.Title numeric style={styles.table_title_20}>
                        <Text bold>UNLOCK</Text>
                      </DataTable.Title>
                      <DataTable.Title numeric style={styles.table_title_18}>
                        <Text bold>TOTAL</Text>
                      </DataTable.Title>
                    </DataTable.Header>
                    {itemData?.data?.data?.map((value: any, key: number) => {
                      return (
                        <DataTable.Row key={key}>
                          <DataTable.Title style={styles.table_title_10}>
                            {value.No}
                          </DataTable.Title>
                          <DataTable.Cell style={styles.table_title_52}>
                            {value.SP}
                          </DataTable.Cell>
                          <DataTable.Cell numeric style={styles.table_title_20}>
                            <Text bold color={"green.600"}>
                              {value.Unlock}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell numeric style={styles.table_title_18}>
                            {value.Total}
                          </DataTable.Cell>
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

export default UnlockSP;
