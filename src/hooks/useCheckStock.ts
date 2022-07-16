import { useQuery } from "react-query";
import { httpClient } from "../services/axios";

export const useCheckStock = ({Tag_ID}: any) => {

  const getCheckStock = async (Tag_ID: any) => {
    
    return await httpClient.get(`/check_stock?Tag_ID=${Tag_ID}`);
  };
  return useQuery<any, any, any>(
    ["CheckStock", Tag_ID],
    () => getCheckStock(Tag_ID),
    {
      enabled: true,
    }
  );
};


