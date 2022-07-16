import { useQuery, useMutation, useQueryClient } from "react-query";
import { httpClient } from "../services/axios";

export const useJobRepack = () => {
  const getJobRepack = async () => {
    return await httpClient.get('/job_repack');
  };
  return useQuery(
    "JobRepack",
    () => getJobRepack(),
    {
      enabled: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      //staleTime: 30000, // not to refresh the data from API is 30 seconds
    }
  );
};

export const useJobRepackBOM = ({JOB_ID}: any) => {

  const getJobRepackBOM = async (JOB_ID: any) => {
    
    return await httpClient.get(`/job_repack_bom?JOB_ID=${JOB_ID}`);
  };
  return useQuery<any, any, any>(
    ["JobRepackBOM", JOB_ID],
    () => getJobRepackBOM(JOB_ID),
    {
      enabled: true,
    }
  );
};

export const useExecJobRepackItem = () => {

  const queryClient = useQueryClient();

  const execJobRepackItem = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/exec_job_repack_item", data);
  };

  return useMutation<any, any, any>(
    "ExecJobRepackItem",
    (params) => execJobRepackItem(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('JobRepackBOM');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

export const useExecJobRepackTransactions = () => {

  const queryClient = useQueryClient();

  const execJobRepackTransactions = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/exec_job_repack_transaction", data);
  };

  return useMutation<any, any, any>(
    "ExecJobRepackTransactions",
    (params) => execJobRepackTransactions(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('JobRepack');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

export const useUpdateJobRepack = () => {

  const queryClient = useQueryClient();

  const updateJobRepack = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/update_job_repack", data);
  };

  return useMutation<any, any, any>(
    "UpdateJobRepack",
    (params) => updateJobRepack(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('JobRepack');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};