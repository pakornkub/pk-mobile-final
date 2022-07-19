import { useMutation } from "react-query";
import { httpClient } from "../services/axios";

export const useUpdateWithdraw = () => {

  const updateWithdraw = async (params: any): Promise<any> => {
    let data = new FormData();

    data.append('Items', JSON.stringify(params) || "");

    return await httpClient.post("/update_withdraw", data);
  };

  return useMutation<any, any, any>(
    "UpdateWithdraw",
    (params) => updateWithdraw(params),
    {
      onSuccess: (response) => {

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

