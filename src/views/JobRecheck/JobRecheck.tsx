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
  HStack,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { DataTable } from "react-native-paper";

import { getDataFromQR } from "../../utils/qr";
import LoadingScreen from "../../components/LoadingScreen";
import AppScanner from "../../components/AppScanner";
import AppAlert from "../../components/AppAlert";

import {
  useJobRecheck,
  useJobRecheckBOM,
  useUpdateJobRecheck,
  useExecJobRecheckTransactions,
  useExecJobRecheckItem,
} from "../../hooks/useJobRecheck";

import { styles } from "../styles";

const JobRecheck: React.FC = () => {
  const initOrder = {};
  const initItem = { QR_NO: "", Item_ID: "" };
  const initBox = { QR_NO_BOX: "" };
  const initErrors = {};

  const toast = useToast();
  const queryClient = useQueryClient();

  const [camera, setCamera] = useState<boolean>(false);
  const [camera2, setCamera2] = useState<boolean>(false);

  const [order, setOrder] = useState<any>(initOrder);
  const [item, setItem] = useState<any>(initItem);
  const [box, setBox] = useState<any>(initBox);
  const [errors, setErrors] = useState<any>(initErrors);

  const [disabledButton, setDisabledButton] = useState<boolean>(true);
  const [disabledItem, setDisabledItem] = useState<boolean>(false);
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
    refetch: orderRefetch,
    status,
    error,
  } = useJobRecheck();

  const {
    isLoading: bomIsLoading,
    data: bomData,
    refetch: bomRefetch,
  } = useJobRecheckBOM({
    JOB_ID: order?.JOB_ID || "",
  });

  const {
    isLoading: itemIsLoading,
    isError: itemIsError,
    status: itemStatus,
    error: itemError,
    mutate: itemMutate,
    data: itemData,
  } = useExecJobRecheckItem();

  const {
    isLoading: transIsLoading,
    isError: transIsError,
    status: transStatus,
    error: transError,
    mutate: transMutate,
    data: transData,
  } = useExecJobRecheckTransactions();

  const {
    isLoading: updateIsLoading,
    isError: updateIsError,
    status: updateStatus,
    error: updateError,
    mutate: updateMutate,
    data: updateData,
  } = useUpdateJobRecheck();

  const handleChangeOrder = (value: string) => {
    if (!value) {
      return;
    }

    clearState("Error");

    let job = value.split("|");

    let jobOrder = [...orderData?.data?.data];

    let BOX_QTY = jobOrder.filter((value: any) => {
      return value.JOB_ID === parseInt(job[0]);
    })[0].BOX_QTY;

    setOrder({
      ...order,
      JOB: value,
      JOB_ID: job[0],
      JOB_QTY: parseInt(job[1]),
      BOX_QTY: parseInt(BOX_QTY),
    });
  };

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
      Item_ID: qr?.Item_ID || "",
    });

    refScanner.current = true;
  };

  const handleScannerBox = (value: any) => {
    setCamera2(false);

    if (!value) {
      return;
    }

    clearState("Error");

    const qr = getDataFromQR(value);

    setBox({ ...box, QR_NO_BOX: qr?.QR_NO || "" });

    refScannerBox.current = true;
  };

  const handleSubmit = () => {
    updateMutate(order);
  };

  const calculateItem = () => {
    const sumBOM =
      bomData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.BOM);
      }, 0) || 0;

    const sumActual =
      bomData?.data?.data?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + parseInt(currentValue.Actual);
      }, 0) || 0;

    if (parseInt(sumActual) === parseInt(sumBOM) && parseInt(sumActual) !== 0) {
      setDisabledItem(true);
      setDisabledBox(false);
    } else {
      setDisabledItem(false);
      setDisabledBox(true);
    }
  };

  const calculateBox = () => {
    if (
      parseInt(order?.JOB_QTY || 0) === parseInt(order?.BOX_QTY || 0) &&
      parseInt(order?.BOX_QTY || 0) !== 0
    ) {
      setDisabledItem(true);
      setDisabledBox(true);
      setDisabledButton(false);
    }
  };

  const validateErrors = (QRType: string) => {
    refScanner.current = false;
    refScannerBox.current = false;

    if (!order.JOB_ID) {
      setErrors({ ...errors, JOB_ID: "Recheck Order is required" });
      clearState("Item");
      return false;
    }

    if (
      bomData.data.data.filter((value: any) => {
        return parseInt(value.Item_ID) === parseInt(item.Item_ID) && parseInt(value.Actual) === parseInt(value.BOM);
      }).length > 0
    ) {
      setErrors({ ...errors, QR_NO: "This Item Actual Completed" });
      clearState("Item");
      return false;
    }

    if (QRType === "Item") {
      if (!item.QR_NO) {
        setErrors({ ...errors, QR_NO: "Invalid QR format" });
        clearState("Item");
        return false;
      }
    } else if (QRType === "Box") {
      if (!box.QR_NO_BOX) {
        setErrors({ ...errors, QR_NO_BOX: "Invalid QR BOX format" });
        clearState("Box");
        return false;
      }
    }

    return true;
  };

  const clearState = (type: string) => {
    if (type === "All") {
      setOrder(initOrder);
      setItem(initItem);
      setBox(initBox);
      setErrors(initErrors);
      setDisabledButton(true);
    } else if (type === "Item") {
      setItem(initItem);
    } else if (type === "Box") {
      setBox(initBox);
    } else if (type === "Order") {
      setOrder(initOrder);
    } else {
      setErrors(initErrors);
    }
  };

  useEffect(() => {
    bomRefetch();
  }, [order]);

  useEffect(() => {
    if (refScanner.current && validateErrors("Item")) {
      itemMutate({ ...order, ...item });
    }
  }, [item]);

  useEffect(() => {
    if (refScannerBox.current && validateErrors("Box")) {
      transMutate({ ...order, ...box });
    }
  }, [box]);

  useEffect(() => {
    handleChangeOrder(order.JOB);
  }, [orderData]);

  useEffect(() => {
    calculateItem();
    calculateBox();
  }, [bomData]);

  useEffect(() => {
    if (itemStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert
            text={itemData?.data?.message || "success"}
            type="success"
          />
        ),
        placement: "top",
        duration: 2000,
      });
    } else if (itemStatus === "error") {
      toast.show({
        render: () => (
          <AppAlert
            text={itemError?.response?.data?.message || "error"}
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
  }, [itemStatus]);

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
      refScannerBox.current = false;
      clearState("Box");
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
    refInputBox?.current?.focus();
  });

  useEffect(() => {
    return () => {
      clearState("All");
      queryClient.clear();
    };
  }, []);

  return (
    <>
      {!camera && !camera2 ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <LoadingScreen show={itemIsLoading || updateIsLoading || transIsLoading} />
            <VStack space={5} p={5}>
              <FormControl isRequired isInvalid={"JOB_ID" in errors}>
                <Select
                  h={50}
                  size={20}
                  width={"100%"}
                  accessibilityLabel="Choose Service"
                  placeholder="RECHECK ORDER NO."
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
                  placeholder="SCAN QR FG"
                  isDisabled={disabledItem}
                  InputRightElement={
                    <Icon
                      size={35}
                      color={"primary.600"}
                      as={<MaterialIcons name="qr-code-scanner" />}
                      onPress={() => setCamera(true)}
                      disabled={disabledItem}
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
                    refreshing={bomIsLoading}
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
                      <DataTable.Title style={styles.table_title_54}>
                        <Text bold>FG</Text>
                      </DataTable.Title>
                      <DataTable.Title numeric style={styles.table_title_18}>
                        <Text bold>ACT</Text>
                      </DataTable.Title>
                      <DataTable.Title numeric style={styles.table_title_18}>
                        <Text bold>BOM</Text>
                      </DataTable.Title>
                    </DataTable.Header>
                    {bomData?.data?.data?.map((value: any, key: number) => {
                      return (
                        <DataTable.Row key={key}>
                          <DataTable.Title style={styles.table_title_10}>
                            {value.No}
                          </DataTable.Title>
                          <DataTable.Cell style={styles.table_title_54}>
                            {value.FG}
                          </DataTable.Cell>
                          <DataTable.Cell numeric style={styles.table_title_18}>
                            <Text bold color={"red.600"}>
                              {value.Actual}
                            </Text>
                          </DataTable.Cell>
                          <DataTable.Cell numeric style={styles.table_title_18}>
                            {value.BOM}
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
                  w="50%"
                  isRequired
                  isInvalid={"QR_NO_BOX" in errors}
                  isDisabled={disabledBox}
                >
                  <Input
                    h={50}
                    size={20}
                    ref={refInputBox}
                    showSoftInputOnFocus={false}
                    variant="underlined"
                    p={2}
                    placeholder="QR BOX"
                    InputRightElement={
                      <Icon
                        size={35}
                        color={"primary.600"}
                        as={<MaterialIcons name="qr-code-scanner" />}
                        onPress={() => setCamera2(true)}
                        disabled={disabledBox}
                      />
                    }
                    value={box?.QR_NO_BOX || ""}
                    onChangeText={(value) => handleScannerBox(value)}
                  />
                  {"QR_NO_BOX" in errors && (
                    <FormControl.ErrorMessage>
                      {errors.QR_NO_BOX}
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <Text fontSize={25}>
                  <Text bold color={"green.600"}>{`${
                    order?.BOX_QTY || 0
                  }`}</Text>
                  {` / ${order?.JOB_QTY || 0} BOX`}
                </Text>
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
      ) : !camera2 ? (
        <AppScanner handleScanner={handleScanner} />
      ) : (
        <AppScanner handleScanner={handleScannerBox} />
      )}
    </>
  );
};

export default JobRecheck;
