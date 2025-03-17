import { useCallback, useEffect, useState } from "react";
import { message, FloatButton, Button, Modal, Progress } from "antd";
import { DEFAULT_REPO_URL, EXTENSION_OPTIONS } from "../../constant";
import { useFileTree } from "../../hooks/useFileTree";
import { useGrading } from "../../hooks/useGrading";
import RepositoryConfig from "../../components/RepositoryConfig";
import ErrorNotification from "../../components/ErrorNotification.tsx";
import GradingPanel from "../../components/GradingPanel/index.tsx";
import FileTreePanel from "../../components/FileTreePanel/index.tsx";
import GradingResultView from "../../components/GradingResults/index.tsx";
import { marked } from "marked";
import { FolderOutlined } from "@ant-design/icons";

const GradePage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isFolderStructureModalVisible, setIsFolderStructureModalVisible] =
    useState(false);
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
    folderCriteria,
    setFolderCriteria,
    gradeLoading,
    gradeError,
    gradeResult,
    gradeFolderStructureResult,
    percentage,
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
  useEffect(() => {
    if (gradeLoading && percentage > 0) {
      messageApi.open({
        key: "grading-progress",
        type: "loading",
        content: (
          <div className="flex flex-col">
            <span>Grading in progress...</span>
            <Progress
              percent={percentage}
              size="small"
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
            />
          </div>
        ),
        duration: 0,
      });
    } else if (!gradeLoading && percentage === 100) {
      messageApi.success({
        key: "grading-progress",
        content: "Grading completed!",
        duration: 2,
      });
    }
  }, [percentage, gradeLoading]);
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
              folderCriteria={folderCriteria}
              setFolderCriteria={setFolderCriteria}
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
          {gradeFolderStructureResult && (
            <>
              <Button
                type="primary"
                icon={<FolderOutlined />}
                onClick={() => setIsFolderStructureModalVisible(true)}
                className="mb-4"
              >
                View Folder Structure Evaluation
              </Button>

              <Modal
                title={
                  <div className="flex items-center space-x-2 text-lg">
                    <FolderOutlined className="text-blue-500" />
                    <span className="font-semibold">
                      Folder Structure Evaluation
                    </span>
                  </div>
                }
                open={isFolderStructureModalVisible}
                onCancel={() => setIsFolderStructureModalVisible(false)}
                width="90%"
                footer={[
                  <Button
                    key="close"
                    onClick={() => setIsFolderStructureModalVisible(false)}
                  >
                    Close
                  </Button>,
                ]}
              >
                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(gradeFolderStructureResult),
                    }}
                  />
                </div>
              </Modal>
            </>
          )}
          {gradeResult.length > 0 && (
            <GradingResultView
              results={gradeResult}
              gradeFolderStructureResult={gradeFolderStructureResult}
            />
          )}
        </div>
        <FloatButton.BackTop />
      </div>
    </>
  );
};

export default GradePage;
