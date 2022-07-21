import { useQuery } from "react-query";
import { httpClient } from "../services/axios";

export const useCheckStock = ({QR_NO}: any) => {

  const getCheckStock = async (QR_NO: any) => {
    
    return await httpClient.get(`/check_stock?QR_NO=${QR_NO}`);
  };
  return useQuery<any, any, any>(
    ["CheckStock", QR_NO],
    () => getCheckStock(QR_NO),
    {
      enabled: true,
    }
  );
};


