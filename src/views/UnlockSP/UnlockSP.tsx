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
  useReceiveSPItem,
} from "../../hooks/useReceiveSP";

import {
  useUnlockSP,
  useUpdateUnlockSP,
  useUpdateUnlockSPTag
} from "../../hooks/useUnlockSP";

const UnlockSP: React.FC = () => {
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
  } = useUnlockSP();

  const {
    isLoading: itemIsLoading,
    data: itemData,
    refetch: itemRefetch,
  } = useReceiveSPItem({
    Rec_ID: form?.Rec_ID || "",
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
  } = useUpdateUnlockSPTag();

  const handleChangeOrder = (value: string) => {

    if (!value) {
      return;
    }

    setForm({ ...form, Rec_ID: value });
    clearValidateUnlockSP();
  };

  const handleScanner = (value: any) => {
    setCamera(false);

    if (!value) {
      return;
    }

    clearValidateUnlockSP();

    const qr = getDataFromQR(value);

    setForm({ ...form, QR_NO: qr?.QR_NO || "", Tag_ID: qr?.Tag_ID || "" });

    refScanner.current = true;
  };

  const handleSubmit = () => {
    updateMutate(form);
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

    if (parseInt(sumUnlock) === parseInt(sumTotal) && parseInt(sumUnlock) !== 0) {
      setDisabledButton(false);
    }
  };

  const validateUnlockSP = () => {
    refScanner.current = false;

    if (!form.Rec_ID) {
      setErrors({ ...errors, Rec_ID: "Receive Order is required" });
      setForm({ ...form, QR_NO: "", Tag_ID: "" });
      return false;
    }

    if (!form.QR_NO) {
      setErrors({ ...errors, QR_NO: "Invalid qr format" });
      return false;
    }

    return true;
  };

  const clearValidateUnlockSP = () => {
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
      validateUnlockSP() && tagMutate(form);
    }
    itemRefetch();
  }, [form]);

  useEffect(() => {
    calculateTotal();
  }, [itemData]);

  useEffect(() => {
    if (tagStatus === "success") {
      toast.show({
        render: () => (
          <AppAlert text={tagData?.data?.message || 'success'} type="success" />
        ),
        placement: "top",
        duration: 2000,
      });
      setForm({ ...form, QR_NO: "", Tag_ID: "" });
      refScanner.current = false;
    } else if (tagStatus === "error") {
      toast.show({
        render: () => <AppAlert text={tagError?.response?.data?.message || 'error'} type="error" />,
        placement: "top",
        duration: 3000,
      });
      setForm({ ...form, QR_NO: "", Tag_ID: "" });
      refScanner.current = false;
    }

  }, [tagStatus]);

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
            <AppLoadingScreen show={updateIsLoading || tagIsLoading} />
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
                      <DataTable.Title numeric>UNLOCK</DataTable.Title>
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
                            {value.Unlock}
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

export default UnlockSP;
