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

export const useReceiveSPItem = ({Order}: any) => {

  const getReceiveSPItem = async (Order: any) => {
    
    return await httpClient.get(`/receive_sp_item?Rec_ID=${Order}`);
  };
  return useQuery<any, any, any>(
    ["ReceiveSPItem", Order],
    () => getReceiveSPItem(Order),
    {
      enabled: false,
    }
  );
};