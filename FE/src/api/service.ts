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
  gradeCodeStream: (
    selectedFiles: string[],
    folder_structure_criteria: string,
    criteriasList: string[],
    projectDescription: string
  ) => {
    const url = new URL(`${API_BASE_URL}/grade-code-stream`);
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selected_files: selectedFiles,
        folder_structure_criteria: folder_structure_criteria,
        criterias_list: criteriasList,
        project_description: projectDescription,
      }),
    });
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
  getCodeContent: async (filePath: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_code_content`, {
        params: { file_path: filePath },
      });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof AxiosError
            ? error.response?.data?.detail || "Failed to fetch code content"
            : "Failed to fetch code content",
      };
    }
  },
  overallGrade: async (data: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/grade_overall`, {
        data: data,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof AxiosError
            ? error.response?.data?.detail
            : "Failed to grade overall",
      };
    }
  },
};
