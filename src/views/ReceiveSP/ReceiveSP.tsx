import React, { useState, useEffect } from "react";
import { Container, Input, Select, Icon } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { DataTable } from 'react-native-paper';

import AppScanner from "../../components/AppScanner";

const ReceiveSP: React.FC = () => {
  const [camera, setCamera] = useState<boolean>(false);
  const [form, setForm] = useState<any>({});

  const handleScanner = (value: any) => {
    setForm({ ...form, QR: value });
    setCamera(false);
  };

  return (
    <>
      {!camera ? (
        <Container h="100%">
          <Select
            width={"100%"}
            accessibilityLabel="Choose Service"
            placeholder="RECEIVE SP ORDER NO."
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
            variant="underlined"
            p={2}
            placeholder="SCAN QR"
            InputRightElement={
              <Icon
              size={25}
                as={
                  <MaterialIcons
                    name="qr-code-scanner"
                    onPress={() => setCamera(true)}
                  />
                }
              />
            }
            value={form.QR}
            onChangeText={(text) => setForm({ ...form, QR: text })}
          />
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

      </DataTable>
        </Container>
      ) : (
        <AppScanner handleScanner={handleScanner} />
      )}
    </>
  );
};

export default ReceiveSP;
