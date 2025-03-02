import { useCallback, useEffect, useState } from "react";
import { DEFAULT_REPO_URL, EXTENSION_OPTIONS } from "./constant";
import { GradingResult, TreeNode } from "./types";
import { apiService } from "./api/service";
import { Button, Card, Input, message, Typography } from "antd";
import FileTree from "./components/FileTree";
import CriteriaInput from "./components/CriteriaInput";
import GradingResultView from "./components/GradingResults";
import Header from "./layout/Header";
import RepositoryConfig from "./components/RepositoryConfig";
const { Title } = Typography;

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL);
  const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [criterias, setCriterias] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [error, setError] = useState("");
  const [gradeResult, setGradeResult] = useState<GradingResult[] | []>([]);
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(
    EXTENSION_OPTIONS.map((option) => option.value)
  );

  const fetchFileTreeData = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await apiService.fetchFileTree(
      repoUrl,
      selectedExtensions
    );

    if (data) {
      setFileTreeData(data);
    } else if (fetchError) {
      setError(fetchError);
    }

    setLoading(false);
  }, [repoUrl, selectedExtensions]);

  const handleExtensionChange = useCallback((value: string[]) => {
    setSelectedExtensions(value);
  }, []);

  const handleFileSelection = useCallback((files: string[]) => {
    setSelectedFiles(files);
  }, []);

  const gradeCode = useCallback(async () => {
    // Validate selected files
    if (selectedFiles.length === 0) {
      message.error({
        content: "Please select at least one file to grade",
        key: "file-selection",
        duration: 3,
      });
      return;
    }

    // Validate criteria
    const validCriterias = criterias.filter(
      (criteria) => criteria.trim() !== ""
    );
    if (validCriterias.length === 0) {
      message.error({
        content: "Please add at least one grading criteria",
        key: "criteria-validation",
        duration: 3,
      });
      return;
    }

    // Show loading message
    message.loading({
      content: "Grading code in progress...",
      key: "grading",
      duration: 0,
    });

    setGradeLoading(true);
    setError("");

    try {
      const { data, error: gradeError } = await apiService.gradeCode(
        selectedFiles,
        validCriterias,
        projectDescription
      );

      if (data) {
        setGradeResult(data);
        message.success({
          content: "Code graded successfully!",
          key: "grading",
          duration: 3,
        });
      } else if (gradeError) {
        setError(gradeError);
        message.error({
          content: gradeError,
          key: "grading",
          duration: 3,
        });
      }
    } catch (error) {
      message.error({
        content: "An unexpected error occurred",
        key: "grading",
        duration: 3,
      });
    } finally {
      setGradeLoading(false);
    }
  }, [selectedFiles, criterias]);

  useEffect(() => {
    setSelectedFiles([]);
  }, [fileTreeData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <Header />

        <RepositoryConfig
          repoUrl={repoUrl}
          loading={loading}
          selectedExtensions={selectedExtensions}
          onRepoUrlChange={setRepoUrl}
          onExtensionChange={handleExtensionChange}
          onFetchFiles={fetchFileTreeData}
        />
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card
            title={<Title level={4}>File Tree</Title>}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
              {fileTreeData.length > 0 ? (
                <FileTree
                  nodes={fileTreeData}
                  onFileSelection={handleFileSelection}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>No files to display. Clone a repository first.</p>
                </div>
              )}
            </div>
          </Card>

          <Card
            title={<Title level={4}>Grading Criteria</Title>}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Input.TextArea
              size="large"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Enter project description (optional)"
              className="!rounded-lg mb-4"
              rows={4}
            />
            <div className="space-y-4">
              <CriteriaInput
                criterias={criterias}
                setCriterias={setCriterias}
              />
              <Button
                type="primary"
                size="large"
                className="w-full !bg-green-500 hover:!bg-green-600 disabled:opacity-50"
                onClick={gradeCode}
                disabled={
                  gradeLoading ||
                  selectedFiles.length === 0 ||
                  criterias.filter((c) => c.trim() !== "").length === 0
                }
                loading={gradeLoading}
              >
                {gradeLoading ? "Grading Code..." : "Grade Selected Files"}
              </Button>
            </div>
          </Card>
        </div>

        {selectedFiles.length > 0 && (
          <Card
            title={<Title level={4}>Selected Files</Title>}
            className="mb-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <ul className="list-disc pl-5 space-y-1">
              {selectedFiles.map((file) => (
                <li key={file} className="text-gray-700">
                  {file}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {gradeResult && <GradingResultView results={gradeResult} />}
      </div>
    </div>
  );
};

export default App;
