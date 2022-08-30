import { useQuery, useMutation, useQueryClient } from "react-query";
import { httpClient } from "../services/axios";

export const useUnlockSP = () => {
  const getUnlockSP = async () => {
    return await httpClient.get('/unlock_sp');
  };
  return useQuery(
    "UnlockSP",
    () => getUnlockSP(),
    {
      enabled: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      //staleTime: 30000, // not to refresh the data from API is 30 seconds
    }
  );
};

export const useUpdateUnlockSP = () => {

  const queryClient = useQueryClient();

  const updateUnlockSP = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/update_unlock_sp", data);
  };

  return useMutation<any, any, any>(
    "UpdateUnlockSP",
    (params) => updateUnlockSP(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('UnlockSP');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

export const useExecUnlockSPTag = () => {

  const queryClient = useQueryClient();

  const execUnlockSPTag = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/exec_unlock_sp_tag", data);
  };

  return useMutation<any, any, any>(
    "ExecUnlockSPTag",
    (params) => execUnlockSPTag(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('ReceiveSPItem');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};