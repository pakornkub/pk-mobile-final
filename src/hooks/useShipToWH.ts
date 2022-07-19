import { useMutation } from "react-query";
import { httpClient } from "../services/axios";

export const useUpdateShipToWH = () => {

  const updateShipToWH = async (params: any): Promise<any> => {
    let data = new FormData();

    data.append('Items', JSON.stringify(params) || "");

    return await httpClient.post("/update_ship_to_wh", data);
  };

  return useMutation<any, any, any>(
    "UpdateShipToWH",
    (params) => updateShipToWH(params),
    {
      onSuccess: (response) => {

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

