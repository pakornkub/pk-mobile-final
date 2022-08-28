import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
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

  const inputRef = useRef<any>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [camera, setCamera] = useState<boolean>(false);

  const [disabledButton, setDisabledButton] = useState<boolean>(true);

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
    Rec_ID: watch("Rec_ID") || "",
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

  const handleScanner = (data: any) => {
    setCamera(false);

    if (!data) {
      return;
    }

    const qr = getDataFromQR(data);

    if (qr.Tag_ID) {
      setValue("QR_NO", qr?.QR_NO || "");
      setValue("Tag_ID", qr?.Tag_ID || "");
    }

    handleSubmit(onExecSubmit)();
  };

  const onExecSubmit = async (data: any) => {
    transMutate(data);
  };

  const onUpdateSubmit = (data: any) => {
    updateMutate(data);
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

  useEffect(() => {
    itemRefetch();
  }, [watch("Rec_ID"), transStatus, updateStatus]);

  useEffect(() => {
    calculateTotal();
  }, [itemData]);

  useEffect(() => {
    setValue("QR_NO", "");
    setValue("Tag_ID", "");

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

      setValue("QR_NO", "");
      setValue("Tag_ID", "");
      setValue("Rec_ID", "");
      setDisabledButton(true);
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
  }, [updateStatus]);

  useEffect(() => {
    inputRef?.current?.focus();
  });

  return (
    <>
      {!camera ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <LoadingScreen show={updateIsLoading || transIsLoading} />
            <VStack space={10} p={5}>
              <FormControl isRequired isInvalid={"Rec_ID" in errors}>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      width={"100%"}
                      placeholder="RECEIVE SP ORDER NO."
                      selectedValue={value}
                      onValueChange={onChange}
                    >
                      {orderData?.data?.data?.map((value: any) => {
                        return (
                          <Select.Item
                            key={value.Rec_ID}
                            shadow={2}
                            label={value.Rec_NO}
                            value={value.Rec_ID.toString()}
                          />
                        );
                      })}
                    </Select>
                  )}
                  name="Rec_ID"
                  rules={{ required: "Receive Order is required" }}
                  defaultValue=""
                />
                <FormControl.ErrorMessage>
                  {errors.Rec_ID?.message}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={"QR_NO" in errors}>
                <Controller
                  control={control}
                  render={({ field: { value } }) => (
                    <Input
                      ref={inputRef}
                      showSoftInputOnFocus={false}
                      InputRightElement={
                        <Icon
                          size={25}
                          as={<MaterialIcons name="qr-code-scanner" />}
                          onPress={() => setCamera(true)}
                        />
                      }
                      variant="underlined"
                      p={2}
                      placeholder="SCAN QR"
                      onChangeText={handleScanner}
                      value={value}
                    />
                  )}
                  name="QR_NO"
                  rules={{ required: "Invalid QR format" }}
                  defaultValue=""
                />
                <FormControl.ErrorMessage>
                  {errors.QR_NO?.message}
                </FormControl.ErrorMessage>
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
                onPress={handleSubmit(onUpdateSubmit)}
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
