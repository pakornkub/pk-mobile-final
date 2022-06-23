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

import AppScanner from "../../components/AppScanner";

const ReceiveSP: React.FC = () => {
  const [refresh, setRefresh] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [form, setForm] = useState<any>({});

  const disabledInput = useRef<boolean>(true);
  const focusInput = useRef<boolean>(false);

  const handleScanner = (value: any) => {
    setForm({ ...form, QR: value });
    setCamera(false);
  };

  const handleChange = (Order: string, value: string) => {
    setForm({ ...form, [Order]: value });
    disabledInput.current = false;
    focusInput.current = true;
  };

  //? when search & refresh to call function
  useEffect(() => {
    console.log(1);
  }, [refresh]);

  return (
    <>
      {!camera ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box flex={1}>
            <VStack space={10} p={5}>
              <Select
                width={"100%"}
                accessibilityLabel="Choose Service"
                placeholder="RECEIVE SP ORDER NO."
                onValueChange={(value) => handleChange("Order", value)}
              >
                <Select.Item shadow={2} label="UX Research" value="ux" />
                <Select.Item shadow={2} label="Web Development" value="web" />
                <Select.Item
                  shadow={2}
                  label="Cross Platform Development"
                  value="cross"
                />
                <Select.Item shadow={2} label="UI Designing" value="ui" />
                <Select.Item
                  shadow={2}
                  label="Backend Development"
                  value="backend"
                />
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
                    refreshing={refresh}
                    onRefresh={() => setRefresh(true)}
                  />
                }
              >
                <TouchableOpacity activeOpacity={1}>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>NO.</DataTable.Title>
                      <DataTable.Title>SP</DataTable.Title>
                      <DataTable.Title numeric>UNLOCK</DataTable.Title>
                      <DataTable.Title numeric>LOCK</DataTable.Title>
                      <DataTable.Title numeric>TOTAL</DataTable.Title>
                    </DataTable.Header>

                    <DataTable.Row>
                      <DataTable.Title>1</DataTable.Title>
                      <DataTable.Cell>ITEM A</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                      <DataTable.Title>2</DataTable.Title>
                      <DataTable.Cell>ITEM B</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Title>3</DataTable.Title>
                      <DataTable.Cell>ITEM C</DataTable.Cell>
                      <DataTable.Cell numeric>0</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                      <DataTable.Cell numeric>100</DataTable.Cell>
                    </DataTable.Row>
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
