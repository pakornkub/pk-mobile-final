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
  Text,
  HStack,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { DataTable } from "react-native-paper";

import { getDataFromQR } from "../../utils/qr";
import AppLoadingScreen from "../../components/AppLoadingScreen";
import AppScanner from "../../components/AppScanner";
import AppAlert from "../../components/AppAlert";

import { useJobRepack, useJobRepackBOM, useUpdateJobRepack, useExecJobRepackTransactions, useExecJobRepackItem } from "../../hooks/useJobRepack";

const JobRepack: React.FC = () => {
  const initOrder = { JOB_ID: "" };
  const initItem = { QR_NO: "", Tag_ID: "" };
  const initErrors = {};

  const toast = useToast();

  const [camera, setCamera] = useState<boolean>(false);

  const [order, setOrder] = useState<any>(initOrder);
  const [item, setItem] = useState<any>(initItem);
  const [errors, setErrors] = useState<any>(initErrors);

  const [disabledButton, setDisabledButton] = useState<boolean>(true);
  const [disabledBox, setDisabledBox] = useState<boolean>(true);

  const refInput = useRef<any>(null);
  const refInputBox = useRef<any>(null);
  const refScanner = useRef<boolean>(false);
  const refScannerBox = useRef<boolean>(false);

  const {
    isLoading: orderIsLoading,
    isFetching,
    isError,
    data: orderData,
    status,
    error,
  } = useJobRepack();

  const {
    isLoading: itemIsLoading,
    data: itemData,
    refetch: itemRefetch,
  } = useJobRepackBOM({
    JOB_ID: order?.JOB_ID || "",
  });

  const {
    isLoading: transIsLoading,
    isError: transIsError,
    status: transStatus,
    error: transError,
    mutate: transMutate,
    data: transData,
  } = useExecJobRepackTransactions();

  const {
    isLoading: updateIsLoading,
    isError: updateIsError,
    status: updateStatus,
    error: updateError,
    mutate: updateMutate,
    data: updateData,
  } = useUpdateJobRepack();

  const handleChangeOrder = (value: string) => {
    if (!value) {
      return;
    }

    clearState("Error");

    let job = value.split("|");

    setOrder({
      ...order,
      JOB: value,
      JOB_ID: job[0],
      JOB_QTY: parseInt(job[1]),
    });
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

  const handleScannerBox = (value: any) => {
    setCamera(false);

    refScannerBox.current = true;
  };

  const handleSubmit = () => {
    updateMutate(order);
  };

  const calculateItem = () => {
    const sumBOM =
      itemData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.BOM);
      }, 0) || 0;

    const sumActual =
      itemData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.Actual);
      }, 0) || 0;

    if (parseInt(sumActual) === parseInt(sumBOM) && parseInt(sumActual) !== 0) {
      setDisabledBox(false);
    }
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
    refScannerBox.current = false;

    if (!order.JOB_ID) {
      setErrors({ ...errors, JOB_ID: "Repack Order is required" });
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
      validateErrors() && transMutate({ ...order, ...item });
    }
  }, [item]);

  useEffect(() => {
    //calculateTotal();
    calculateItem();
  }, [itemData]);

  useEffect(() => {
    if (transStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert
            text={transData?.data?.message || "success"}
            type="success"
          />
        ),
        placement: "top",
        duration: 2000,
      });
    } else if (transStatus === "error") {
      toast.show({
        render: () => (
          <AppAlert
            text={transError?.response?.data?.message || "error"}
            type="error"
          />
        ),
        placement: "top",
        duration: 3000,
      });
    }

    return () => {
      refScanner.current = false;
      refScannerBox.current = false;
      clearState("Item");
    };
  }, [transStatus]);

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
      refScannerBox.current = false;
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
            <AppLoadingScreen show={updateIsLoading || transIsLoading} />
            <VStack space={5} p={5}>
              <FormControl isRequired isInvalid={"JOB_ID" in errors}>
                <Select
                  h={50}
                  size={20}
                  width={"100%"}
                  accessibilityLabel="Choose Service"
                  placeholder="REPACK ORDER NO."
                  selectedValue={order.JOB || ""}
                  onValueChange={(value) => handleChangeOrder(value)}
                >
                  {orderData?.data?.data?.map((value: any) => {
                    return (
                      <Select.Item
                        key={value.JOB_ID}
                        label={value.JOB_No}
                        value={`${value.JOB_ID}|${value.JOB_QTY}`}
                      />
                    );
                  })}
                </Select>
                {"JOB_ID" in errors && (
                  <FormControl.ErrorMessage>
                    {errors.JOB_ID}
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
                  placeholder="QR SP"
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
                style={{ height: "45%" }}
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
                        <Text bold>NO.</Text>
                      </DataTable.Title>
                      <DataTable.Title>
                        <Text bold>SP</Text>
                      </DataTable.Title>
                      <DataTable.Title numeric>
                        <Text bold>BOM</Text>
                      </DataTable.Title>
                      <DataTable.Title numeric>
                        <Text bold>ACTUAL</Text>
                      </DataTable.Title>
                    </DataTable.Header>
                    {itemData?.data?.data?.map((value: any, key: number) => {
                      return (
                        <DataTable.Row key={key}>
                          <DataTable.Title style={{ maxWidth: "10%" }}>
                            {value.No}
                          </DataTable.Title>
                          <DataTable.Cell>{value.SP}</DataTable.Cell>
                          <DataTable.Cell numeric>{value.BOM}</DataTable.Cell>
                          <DataTable.Cell numeric>
                            {value.Actual}
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
              <HStack alignItems={"center"} justifyContent={"space-between"}>
                <FormControl
                  h={50}
                  w="50%"
                  isRequired
                  isInvalid={"QR_NO_BOX" in errors}
                  isDisabled={disabledBox}
                >
                  <Input
                    size={20}
                    ref={refInputBox}
                    showSoftInputOnFocus={false}
                    variant="underlined"
                    p={2}
                    placeholder="QR BOX"
                    InputRightElement={
                      <Icon
                        size={25}
                        as={<MaterialIcons name="qr-code-scanner" />}
                        onPress={() => setCamera(true)}
                        disabled={disabledBox}
                      />
                    }
                    value={item?.QR_NO_BOX || ""}
                    onChangeText={(value) => handleScannerBox(value)}
                  />
                  {"QR_NO_BOX" in errors && (
                    <FormControl.ErrorMessage>
                      {errors.QR_NO_BOX}
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <Text fontSize={25}>{`0/${order?.JOB_QTY || 0} BOX`}</Text>
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

export default JobRepack;
