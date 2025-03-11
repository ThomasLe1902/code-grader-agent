import { useState, useCallback } from "react";
import { MessageInstance } from "antd/es/message/interface";
import { TreeNode } from "../types";
import { apiService } from "../api/service";

interface UseFileTreeProps {
  messageApi: MessageInstance;
  onTreeLoaded?: () => void;
}

export const useFileTree = ({ messageApi, onTreeLoaded }: UseFileTreeProps) => {
  const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFileTree = useCallback(
    async (repoUrl: string, selectedExtensions: string[]) => {
      setLoading(true);
      setFileTreeData([]);
      setError("");

      messageApi.loading({
        content: "Cloning repository...",
        key: "fetch-repo",
        duration: 0,
      });

      const { data, error: fetchError } = await apiService.fetchFileTree(
        repoUrl,
        selectedExtensions
      );

      if (data) {
        setFileTreeData(data);
        messageApi.success({
          content: "Repository cloned successfully!",
          key: "fetch-repo",
          duration: 3,
        });
      } else if (fetchError) {
        setError(fetchError);
        setFileTreeData([]);
        messageApi.error({
          content: fetchError,
          key: "fetch-repo",
          duration: 3,
        });
      }

      setLoading(false);

      if (onTreeLoaded) {
        onTreeLoaded();
      }
    },
    [messageApi, onTreeLoaded]
  );

  const generateProjectDescription = useCallback(
    async (selectedFiles: string[]) => {
      if (selectedFiles.length === 0) {
        messageApi.error({
          content: "Please select files first",
          key: "description-generation",
          duration: 3,
        });
        return null;
      }

      messageApi.loading({
        content: "Generating project description...",
        key: "description-generation",
        duration: 0,
      });

      const { data, error } = await apiService.generateProjectDescription(
        selectedFiles
      );

      if (data) {
        messageApi.success({
          content: "Description generated successfully!",
          key: "description-generation",
          duration: 3,
        });
        return data;
      } else if (error) {
        messageApi.error({
          content: error,
          key: "description-generation",
          duration: 3,
        });
        return null;
      }
    },
    [messageApi]
  );

  return {
    fileTreeData,
    loading,
    error,
    fetchFileTree,
    generateProjectDescription,
  };
};
