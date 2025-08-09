import { useState, useCallback } from "react";
import { MessageInstance } from "antd/es/message/interface";
import { GradeResponse, GradingResult } from "../types";
import { apiService } from "../api/service";
import { DEFAULT_CRITERIA_BE, DEFAULT_CRITERIA_FE } from "../constant";

interface UseGradingProps {
  messageApi: MessageInstance;
  selectedFiles: string[];
  projectDescription: string;
}

export const useGrading = ({
  messageApi,
  selectedFiles,
  projectDescription,
}: UseGradingProps) => {
  const [criteria, setCriteria] = useState<string[]>(
    DEFAULT_CRITERIA_FE.slice(1)
  );
  const [folderCriteria, setFolderCriteria] = useState<string>(
    DEFAULT_CRITERIA_FE[0]
  );
  const [gradeLoading, setGradeLoading] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [error, setError] = useState("");
  const [gradeResult, setGradeResult] = useState<GradingResult[]>([]);
  const [gradeFolderStructureResult, setGradeFolderStructureResult] =
    useState<string>("");
  const loadFrontendCriteria = useCallback(() => {
    setFolderCriteria(DEFAULT_CRITERIA_FE[0]);
    setCriteria(DEFAULT_CRITERIA_FE.slice(1));
    messageApi.success("Frontend criteria loaded");
  }, [messageApi]);

  const loadBackendCriteria = useCallback(() => {
    setFolderCriteria(DEFAULT_CRITERIA_BE[0]);
    setCriteria(DEFAULT_CRITERIA_BE.slice(1));
    messageApi.success("Backend criteria loaded");
  }, [messageApi]);

  const gradeCode = useCallback(
    async (criteriaToUse: string[]) => {
      setError("");
      setGradeResult([]);
      setGradeLoading(true);

      if (selectedFiles.length === 0) {
        messageApi.error({
          content: "Please select at least one file to grade",
          key: "file-selection",
          duration: 3,
        });
        setGradeLoading(false);
        return;
      }

      const validCriteria = criteriaToUse.filter(
        (criteria) => criteria.trim() !== ""
      );

      if (validCriteria.length === 0) {
        messageApi.error({
          content: "Please add at least one grading criteria",
          key: "criteria-validation",
          duration: 3,
        });
        setGradeLoading(false);
        return;
      }

      try {
        messageApi.loading({
          content: "Grading in progress...",
          key: "grading",
          duration: 0,
        });

        // Use simple non-streaming version to prevent crashes
        const { data, error } = await apiService.gradeCodeSimple(
          selectedFiles,
          folderCriteria,
          validCriteria,
          projectDescription
        );

        if (error) {
          throw new Error(error);
        }

        if (data && data.results) {
          // Simulate progress updates for better UX
          setPercentage(50);

          // Set the results from the simple endpoint
          setGradeResult(data.results);
          setGradeFolderStructureResult("Folder structure analysis completed");
          setPercentage(100);

          messageApi.success({
            content: "Code graded successfully!",
            key: "grading",
            duration: 3,
          });
        } else {
          throw new Error("No results received from server");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
        messageApi.error({
          content: errorMessage,
          key: "grading",
          duration: 3,
        });
      } finally {
        setGradeLoading(false);
      }
    },
    [selectedFiles, projectDescription, messageApi]
  );

  return {
    criteria,
    setCriteria,
    folderCriteria,
    setFolderCriteria,
    gradeLoading,
    gradeError: error,
    gradeResult,
    gradeFolderStructureResult,
    percentage,
    gradeCode,
    loadFrontendCriteria,
    loadBackendCriteria,
  };
};
