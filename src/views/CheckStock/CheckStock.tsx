import React, { useState, useEffect, useRef } from "react";
import { TouchableWithoutFeedback, Keyboard,ScrollView,RefreshControl } from "react-native";
import {
  Box,
  Input,
  Icon,
  VStack,
  useToast,
  FormControl,
  Text,
  Divider,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

import { useCheckStock } from "../../hooks/useCheckStock";

import { getDataFromQR } from "../../utils/qr";
import AppLoadingScreen from "../../components/AppLoadingScreen";
import AppScanner from "../../components/AppScanner";
import AppAlert from "../../components/AppAlert";

const CheckStock: React.FC = () => {
  const initItem = { QR_NO: "", Tag_ID: "" };
  const initErrors = {};

  const toast = useToast();

  const [camera, setCamera] = useState<boolean>(false);

  const [item, setItem] = useState<any>(initItem);
  const [errors, setErrors] = useState<any>(initErrors);

  const refInput = useRef<any>(null);
  const refScanner = useRef<boolean>(false);

  const {
    isLoading: itemIsLoading,
    status: itemStatus,
    error: itemError,
    data: itemData,
    refetch: itemRefetch,
  } = useCheckStock({
    Tag_ID: item?.Tag_ID || "",
  });

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

  const validateErrors = () => {
    refScanner.current = false;

    if (!item.QR_NO || !item.Tag_ID) {
      setErrors({ ...errors, QR_NO: "Invalid QR format" });
      clearState("Item");
      return false;
    }

    return true;
  };

  const clearState = (type: string) => {
    if (type === "Item") {
      setItem(initItem);
    } else {
      setErrors(initErrors);
    }
  };

  useEffect(() => {
    if (refScanner.current) {
      validateErrors() && itemRefetch();
    }
  }, [item]);

  useEffect(() => {
    if (itemStatus === "error") {
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
      clearState("Item");
    }

    return () => {
      refScanner.current = false;
    };
  }, [itemStatus]);

  useEffect(() => {
    refInput?.current?.focus();
  });

  return (
    <>
      {!camera ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <AppLoadingScreen show={itemIsLoading} />
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
                  value={""}
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
                refreshControl={
                  <RefreshControl
                    refreshing={itemIsLoading}
                    onRefresh={() => itemRefetch()}
                  />
                }
              >
                <Text fontSize="md"><Text style={styles.textHeader}>QR :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.QR_NO || ""}</Text></Text>
                <Divider style={styles.divder} />
                <Text fontSize="md"><Text style={styles.textHeader}>ORDER :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.Rec_NO || ""}</Text></Text>
                <Divider style={styles.divder}/>
                <Text fontSize="md"><Text style={styles.textHeader}>ORDER DATE :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.Rec_Datetime || ""}</Text></Text>
                <Divider style={styles.divder}/>
                <Text fontSize="md"><Text style={styles.textHeader}>ITEM :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.ITEM_CODE || ""}</Text></Text>
                <Divider style={styles.divder}/>
                <Text fontSize="md"><Text style={styles.textHeader}>DESCRIPTION :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.ITEM_DESCRIPTION || ""}</Text></Text>
                <Divider style={styles.divder}/>
                <Text fontSize="md"><Text style={styles.textHeader}>CREATE BY :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.Create_By || ""}</Text></Text>
                <Divider style={styles.divder}/>
                <Text fontSize="md"><Text style={styles.textHeader}>CREATE DATE :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.Create_Date || ""}</Text></Text>
                <Divider style={styles.divder}/>
                <Text fontSize="md"><Text style={styles.textHeader}>STATUS :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.Status_Item || ""}</Text></Text>
                <Divider style={styles.divder}/>
                <Text fontSize="md"><Text style={styles.textHeader}>LOCATION :{`   `}</Text><Text style={styles.textContent}>{itemData?.data?.data?.Location || ""}</Text></Text>
              </ScrollView>
            </VStack>
          </Box>
        </TouchableWithoutFeedback>
      ) : (
        <AppScanner handleScanner={handleScanner} />
      )}
    </>
  );
};

const styles : any = {

  divder : {
    marginTop: 10,
    marginBottom: 10,
  },
  textHeader: {
    fontWeight: "bold",
  },
  textContent:{
    color: "gray",
  }
  
}

export default CheckStock;
