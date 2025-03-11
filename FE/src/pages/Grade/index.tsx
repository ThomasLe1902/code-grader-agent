import { useCallback, useState } from "react";
import { message, FloatButton } from "antd";
import { DEFAULT_REPO_URL, EXTENSION_OPTIONS } from "../../constant";
import { useFileTree } from "../../hooks/useFileTree";
import { useGrading } from "../../hooks/useGrading";
import RepositoryConfig from "../../components/RepositoryConfig";
import ErrorNotification from "../../components/ErrorNotification.tsx";
import GradingPanel from "../../components/GradingPanel/index.tsx";
import FileTreePanel from "../../components/FileTreePanel/index.tsx";
import GradingResultView from "../../components/GradingResults/index.tsx";

const GradePage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(
    EXTENSION_OPTIONS.map((option) => option.value)
  );

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const [projectDescription, setProjectDescription] = useState<string>("");

  const {
    fileTreeData,
    loading: treeLoading,
    error: treeError,
    fetchFileTree,
    generateProjectDescription,
  } = useFileTree({
    messageApi,
    onTreeLoaded: () => setSelectedFiles([]),
  });

  const {
    criteria,
    setCriteria,
    gradeLoading,
    gradeError,
    gradeResult,
    gradeCode,
    loadFrontendCriteria,
    loadBackendCriteria,
  } = useGrading({
    messageApi,
    selectedFiles,
    projectDescription,
  });

  // Handler functions
  const handleExtensionChange = useCallback((value: string[]) => {
    setSelectedExtensions(value);
  }, []);

  const handleFileSelection = useCallback((files: string[]) => {
    setSelectedFiles(files);
  }, []);

  const handleFetchFileTree = useCallback(() => {
    fetchFileTree(repoUrl, selectedExtensions);
  }, [fetchFileTree, repoUrl, selectedExtensions]);

  const handleGenerateDescription = useCallback(() => {
    generateProjectDescription(selectedFiles).then((description) => {
      if (description) {
        setProjectDescription(description);
      }
    });
  }, [generateProjectDescription, selectedFiles]);

  const error = treeError || gradeError;

  return (
    <>
      {contextHolder}
      <div className="min-h-screen p-6">
        <div className="container mx-auto max-w-6xl">
          <RepositoryConfig
            repoUrl={repoUrl}
            loading={treeLoading}
            selectedExtensions={selectedExtensions}
            onRepoUrlChange={setRepoUrl}
            onExtensionChange={handleExtensionChange}
            onFetchFiles={handleFetchFileTree}
          />

          {error && <ErrorNotification message={error} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FileTreePanel
              fileTreeData={fileTreeData}
              selectedFiles={selectedFiles}
              onFileSelection={handleFileSelection}
            />

            <GradingPanel
              criteria={criteria}
              setCriteria={setCriteria}
              projectDescription={projectDescription}
              setProjectDescription={setProjectDescription}
              onGenerateDescription={handleGenerateDescription}
              onGradeCode={() => gradeCode(criteria)}
              onLoadFrontendCriteria={loadFrontendCriteria}
              onLoadBackendCriteria={loadBackendCriteria}
              isGenerateDisabled={selectedFiles.length === 0}
              isGradeDisabled={
                gradeLoading ||
                selectedFiles.length === 0 ||
                criteria.filter((c) => c.trim() !== "").length === 0
              }
              gradeLoading={gradeLoading}
            />
          </div>

          {gradeResult.length > 0 && (
            <GradingResultView results={gradeResult} />
          )}
        </div>
        <FloatButton.BackTop />
      </div>
    </>
  );
};

export default GradePage;
