import { useCallback, useEffect, useState } from "react";
import { DEFAULT_REPO_URL, EXTENSION_OPTIONS } from "./constant";
import { GradingResult, TreeNode } from "./types";
import { apiService } from "./api/service";
import { Button, Card, Input, message, Select, Typography } from "antd";
import FileTree from "./components/FileTree";
import CriteriaInput from "./components/CriteriaInput";
import GradingResultView from "./components/GradingResults";
import { CloudDownloadOutlined, CodeOutlined } from "@ant-design/icons";
const { Title } = Typography;

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL);
  const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [criterias, setCriterias] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [error, setError] = useState("");
  const [gradeResult, setGradeResult] = useState<GradingResult | null>(null);
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
    const validCriterias = criterias.filter(
      (criteria) => criteria.trim() !== ""
    );

    if (selectedFiles.length === 0) {
      message.error("Please select at least one file to grade");
      return;
    }

    if (validCriterias.length === 0) {
      message.error("Please add at least one grading criteria");
      return;
    }

    setGradeLoading(true);
    setError("");

    const { data, error: gradeError } = await apiService.gradeCode(
      selectedFiles,
      validCriterias
    );

    if (data) {
      console.log(data);

      setGradeResult(data);
      message.success("Code graded successfully");
    } else if (gradeError) {
      setError(gradeError);
      message.error(gradeError);
    }
    setGradeLoading(false);
  }, [selectedFiles, criterias]);

  // Reset selected files when file tree changes
  useEffect(() => {
    setSelectedFiles([]);
  }, [fileTreeData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8">
          <Title level={1} className="!text-4xl !text-blue-600 mb-2">
            <CodeOutlined className="mr-2" />
            Code Grading Assistant
          </Title>
          <p className="text-gray-600">Analyze and grade your code with AI</p>
        </header>

        <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <Input
              size="large"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Enter GitHub repository URL"
              className="!rounded-lg"
            />
            <Select
              size="large"
              mode="multiple"
              className="w-full"
              placeholder="Select file extensions"
              onChange={handleExtensionChange}
              options={EXTENSION_OPTIONS}
              defaultValue={selectedExtensions}
            />
            <Button
              type="primary"
              size="large"
              icon={<CloudDownloadOutlined />}
              onClick={fetchFileTreeData}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Cloning Repository..." : "Clone Repository"}
            </Button>
          </div>
        </Card>

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
            <div className="space-y-4">
              <CriteriaInput
                criterias={criterias}
                setCriterias={setCriterias}
              />
              <Button
                type="primary"
                size="large"
                className="w-full !bg-green-500 hover:!bg-green-600"
                onClick={gradeCode}
                disabled={gradeLoading || selectedFiles.length === 0}
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

        {gradeResult && <GradingResultView result={gradeResult} />}
      </div>
    </div>
  );
};

export default App;
