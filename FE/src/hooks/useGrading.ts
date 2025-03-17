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
        const response = await apiService.gradeCodeStream(
          selectedFiles,
          folderCriteria,
          validCriteria,
          projectDescription
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Stream reader not available");
        }

        messageApi.loading({
          content: "Grading in progress...",
          key: "grading",
          duration: 0,
        });

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk: GradeResponse = JSON.parse(
            decoder.decode(value, { stream: true })
          );

          if (chunk.type === "noti") {
            messageApi.loading({
              content: chunk.output as string,
              key: "grading",
              duration: 0,
            });
            setPercentage(chunk.percentage as number);
          } else if (chunk.type === "folder_structure") {
            setGradeFolderStructureResult(chunk.output as string);
            setPercentage(chunk.percentage as number);
          } else if (chunk.type === "final") {
            setGradeResult(chunk.output as GradingResult[]);
            setPercentage(chunk.percentage as number);
          }
        }

        messageApi.success({
          content: "Code graded successfully!",
          key: "grading",
          duration: 3,
        });
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
