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
import LoadingScreen from "../../components/LoadingScreen";
import AppScanner from "../../components/AppScanner";
import AppAlert from "../../components/AppAlert";

import {
  useReceiveSP,
  useReceiveSPItem,
  useExecReceiveSPTransactions,
  useUpdateReceiveSP,
} from "../../hooks/useReceiveSP";

const ReceiveSP: React.FC = () => {
  const toast = useToast();

  const [refresh, setRefresh] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});
  const [form, setForm] = useState<any>({});

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
  } = useReceiveSP();

  const {
    isLoading: itemIsLoading,
    data: itemData,
    refetch: itemRefetch,
  } = useReceiveSPItem({
    Rec_ID: form?.Rec_ID || "",
  });

  const {
    isLoading: transIsLoading,
    isError: transIsError,
    status: transStatus,
    error: transError,
    mutate: transMutate,
    data: transData,
  } = useExecReceiveSPTransactions();

  const {
    isLoading: updateIsLoading,
    isError: updateIsError,
    status: updateStatus,
    error: updateError,
    mutate: updateMutate,
    data: updateData,
  } = useUpdateReceiveSP();

  const handleChangeOrder = (value: string) => {
    if (!value) {
      return;
    }
    
    setForm({ ...form, Rec_ID: value });
    clearValidateReceiveSP();
  };

  const handleScanner = (value: any) => {
    setCamera(false);

    if (!value) {
      return;
    }

    clearValidateReceiveSP();

    const qr = getDataFromQR(value);

    setForm({ ...form, QR_NO: qr?.QR_NO || "", Tag_ID: qr?.Tag_ID || "" });

    refScanner.current = true;
  };

  const handleSubmit = () => {
    updateMutate(form);
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

  const validateReceiveSP = () => {
    refScanner.current = false;

    if (!form.Rec_ID) {
      setErrors({ ...errors, Rec_ID: "Receive Order is required" });
      setForm({ ...form, QR_NO: "", Tag_ID: "" });
      return false;
    }

    if (!form.QR_NO) {
      setErrors({ ...errors, QR_NO: "Invalid QR format" });
      setForm({ ...form, QR_NO: "", Tag_ID: "" });
      return false;
    }

    return true;
  };

  const clearValidateReceiveSP = () => {
    let err = { ...errors };
    delete err.Rec_ID;
    delete err.QR_NO;
    setErrors(err);
  };

  const clearForm = () => {
    setForm({});
    setErrors({});
    setDisabledButton(true);
  };

  useEffect(() => {
    if (refScanner.current) {
      validateReceiveSP() && transMutate(form);
    }
    itemRefetch();
  }, [form]);

  useEffect(() => {
    calculateTotal();
  }, [itemData]);

  useEffect(() => {
    if (transStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert text={transData?.data?.message || 'success'} type="success" />
        ),
        placement: "top",
        duration: 2000,
      });
      setForm({ ...form, QR_NO: "", Tag_ID: "" });
      refScanner.current = false;
    } else if (transStatus === "error") {
      toast.show({
        render: () => <AppAlert text={transError?.response?.data?.message || 'error'} type="error" />,
        placement: "top",
        duration: 3000,
      });
      setForm({ ...form, QR_NO: "", Tag_ID: "" });
      refScanner.current = false;
    }
  }, [transStatus]);

  useEffect(() => {
    if (updateStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert
            text={updateData?.data?.message || 'success'}
            type="success"
          />
        ),
        placement: "top",
        duration: 2000,
      });
      clearForm();
    } else if (updateStatus === "error") {
      toast.show({
        render: () => <AppAlert text={updateError?.response?.data?.message || 'error'} type="error" />,
        placement: "top",
        duration: 3000,
      });
    }
  }, [updateStatus]);

  useEffect(() => {
    refInput?.current?.focus();
  });

  return (
    <>
      {!camera ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <LoadingScreen show={updateIsLoading || transIsLoading} />
            <VStack space={10} p={5}>
              <FormControl isRequired isInvalid={"Rec_ID" in errors}>
                <Select
                  width={"100%"}
                  accessibilityLabel="Choose Service"
                  placeholder="RECEIVE SP ORDER NO."
                  selectedValue={form?.Rec_ID || null}
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
                  value={form?.QR_NO || ""}
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
                          <DataTable.Cell numeric>
                            {value.Lock}
                          </DataTable.Cell>
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

export default ReceiveSP;
