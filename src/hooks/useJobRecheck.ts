import { useQuery, useMutation, useQueryClient } from "react-query";
import { httpClient } from "../services/axios";

export const useJobRecheck = () => {
  const getJobRecheck = async () => {
    return await httpClient.get('/job_recheck');
  };
  return useQuery(
    "JobRecheck",
    () => getJobRecheck(),
    {
      enabled: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      //staleTime: 30000, // not to refresh the data from API is 30 seconds
    }
  );
};

export const useJobRecheckBOM = ({JOB_ID}: any) => {

  const getJobRecheckBOM = async (JOB_ID: any) => {
    
    return await httpClient.get(`/job_recheck_bom?JOB_ID=${JOB_ID}`);
  };
  return useQuery<any, any, any>(
    ["JobRecheckBOM", JOB_ID],
    () => getJobRecheckBOM(JOB_ID),
    {
      enabled: true,
    }
  );
};

export const useExecJobRecheckItem = () => {

  const queryClient = useQueryClient();

  const execJobRecheckItem = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/exec_job_recheck_item", data);
  };

  return useMutation<any, any, any>(
    "ExecJobRecheckItem",
    (params) => execJobRecheckItem(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('JobRecheckBOM');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

export const useExecJobRecheckTransactions = () => {

  const queryClient = useQueryClient();

  const execJobRecheckTransactions = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/exec_job_recheck_transaction", data);
  };

  return useMutation<any, any, any>(
    "ExecJobRecheckTransactions",
    (params) => execJobRecheckTransactions(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('JobRecheck');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};

export const useUpdateJobRecheck = () => {

  const queryClient = useQueryClient();

  const updateJobRecheck = async (params: any): Promise<any> => {
    let data = new FormData();

    Object.keys(params).forEach((value) => {
      data.append(value, params[value] || "");
    });

    return await httpClient.post("/update_job_recheck", data);
  };

  return useMutation<any, any, any>(
    "UpdateJobRecheck",
    (params) => updateJobRecheck(params),
    {
      onSuccess: (response) => {

        queryClient.invalidateQueries('JobRecheck');

      },
      onError: (error) => {

        console.log(error?.response?.data?.message || error.message);

      },
    }
  );
};