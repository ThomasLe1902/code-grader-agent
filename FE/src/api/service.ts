import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../constant";

export const apiService = {
  fetchFileTree: async (repoUrl: string, extensions: string[]) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/get-file-tree/`, {
        url: repoUrl,
        extensions,
      });
      return { data: response.data.file_tree, error: null };
    } catch (err) {
      return { data: null, error: "Failed to fetch file tree data" };
    }
  },

  gradeCode: async (
    selectedFiles: string[],
    criteriasList: string[],
    projectDescription: string
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/grade-code/`, {
        selected_files: selectedFiles,
        criterias_list: criteriasList,
        project_description: projectDescription,
      });
      return { data: response.data, error: null };
    } catch (err) {
      return { data: null, error: "Failed to grade code" };
    }
  },
  generateProjectDescription: async (selectedFiles: string[]) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/project_description_generation`,
        {
          selected_files: selectedFiles,
        }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof AxiosError
            ? error.response?.data?.detail
            : "Failed to generate description",
      };
    }
  },
};
