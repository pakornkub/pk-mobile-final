import { useQuery, useMutation, useQueryClient } from "react-query";
import { httpClient } from "../services/axios";

export const useReceiveSP = () => {
  const getReceiveSP = async () => {
    return await httpClient.get('/receive_sp');
  };
  return useQuery(
    "ReceiveSP",
    () => getReceiveSP(),
    {
      enabled: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      //staleTime: 30000, // not to refresh the data from API is 30 seconds
    }
  );
};

export const useReceiveSPItem = ({Rec_ID}: any) => {

  const getReceiveSPItem = async (Rec_ID: any) => {
    
    return await httpClient.get(`/receive_sp_item?Rec_ID=${Rec_ID}`);
  };
  return useQuery<any, any, any>(
    ["ReceiveSPItem", Rec_ID],
    () => getReceiveSPItem(Rec_ID),
    {
      enabled: true,
    }
  );
};

export const useExecReceiveSPTransactions = () => {

  const queryClient = useQueryClient();

  const execReceiveSPTransactions = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/exec_receive_sp_transaction", data);
  };

  return useMutation<any, any, any>(
    "ExecReceiveSPTransactions",
    (params) => execReceiveSPTransactions(params),
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

export const useUpdateReceiveSP = () => {

  const queryClient = useQueryClient();

  const updateReceiveSP = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/update_receive_sp", data);
  };

  return useMutation<any, any, any>(
    "UpdateReceiveSP",
    (params) => updateReceiveSP(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('ReceiveSP');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};