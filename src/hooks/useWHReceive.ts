import { useMutation } from "react-query";
import { httpClient } from "../services/axios";

export const useUpdateWHReceive = () => {

  const updateWHReceive = async (params: any): Promise<any> => {
    let data = new FormData();

    data.append('Items', JSON.stringify(params) || "");

    return await httpClient.post("/update_wh_receive", data);
  };

  return useMutation<any, any, any>(
    "UpdateWHReceive",
    (params) => updateWHReceive(params),
    {
      onSuccess: (response) => {

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

