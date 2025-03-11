// import { useCallback, useEffect, useState } from "react";
// import {
//   DEFAULT_CRITERIA_FE,
//   DEFAULT_CRITERIA_BE,
//   DEFAULT_REPO_URL,
//   EXTENSION_OPTIONS,
// } from "./constant";
// import { GradeResponse, GradingResult, TreeNode } from "./types";
// import { apiService } from "./api/service";
// import {
//   Button,
//   Card,
//   Input,
//   message,
//   Typography,
//   Badge,
//   Drawer,
//   Space,
//   FloatButton,
// } from "antd";
// import { FileOutlined, EyeOutlined } from "@ant-design/icons";
// import FileTree from "./components/FileTree";
// import CriteriaInput from "./components/CriteriaInput";
// import GradingResultView from "./components/GradingResults";
// import Header from "./layout/Header";
// import RepositoryConfig from "./components/RepositoryConfig";
// const { Title } = Typography;

// const App: React.FC = () => {
//   const [messageApi, contextHolder] = message.useMessage();

//   const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO_URL);
//   const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
//   const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
//   const [criterias, setCriterias] = useState<string[]>(DEFAULT_CRITERIA_FE);
//   const [loading, setLoading] = useState(false);
//   const [gradeLoading, setGradeLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [gradeResult, setGradeResult] = useState<GradingResult[] | []>([]);
//   const [projectDescription, setProjectDescription] = useState<string>("");
//   const [selectedExtensions, setSelectedExtensions] = useState<string[]>(
//     EXTENSION_OPTIONS.map((option) => option.value)
//   );
//   const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);

//   const fetchFileTreeData = useCallback(async () => {
//     setLoading(true);
//     setFileTreeData([]);
//     setSelectedFiles([]);
//     setError("");
//     setGradeResult([]);
//     setProjectDescription("");
//     setGradeLoading(false);
//     messageApi.loading({
//       content: "Cloning repository...",
//       key: "fetch-repo",
//       duration: 0,
//     });
//     const { data, error: fetchError } = await apiService.fetchFileTree(
//       repoUrl,
//       selectedExtensions
//     );

//     if (data) {
//       setFileTreeData(data);
//       messageApi.success({
//         content: "Repository cloned successfully!",
//         key: "fetch-repo",
//         duration: 3,
//       });
//     } else if (fetchError) {
//       setError(fetchError);
//       setFileTreeData([]);
//       messageApi.error({
//         content: fetchError,
//         key: "fetch-repo",
//         duration: 3,
//       });
//     }

//     setLoading(false);
//   }, [repoUrl, selectedExtensions]);

//   const handleExtensionChange = useCallback((value: string[]) => {
//     setSelectedExtensions(value);
//   }, []);
//   const handleSetFECriteria = useCallback(() => {
//     setCriterias(DEFAULT_CRITERIA_FE);
//     messageApi.success("Frontend criteria loaded");
//   }, []);

//   const handleSetBECriteria = useCallback(() => {
//     setCriterias(DEFAULT_CRITERIA_BE);
//     messageApi.success("Backend criteria loaded");
//   }, []);

//   const handleFileSelection = useCallback((files: string[]) => {
//     setSelectedFiles(files);
//   }, []);

//   const showSelectedFiles = useCallback(() => {
//     setIsFilesDrawerOpen(true);
//   }, []);

//   const closeFilesDrawer = useCallback(() => {
//     setIsFilesDrawerOpen(false);
//   }, []);
//   const generateDescription = useCallback(async () => {
//     if (selectedFiles.length === 0) {
//       messageApi.error({
//         content: "Please select files first",
//         key: "description-generation",
//         duration: 3,
//       });
//       return;
//     }

//     messageApi.loading({
//       content: "Generating project description...",
//       key: "description-generation",
//       duration: 0,
//     });

//     const { data, error } = await apiService.generateProjectDescription(
//       selectedFiles
//     );

//     if (data) {
//       setProjectDescription(data);
//       messageApi.success({
//         content: "Description generated successfully!",
//         key: "description-generation",
//         duration: 3,
//       });
//     } else if (error) {
//       messageApi.error({
//         content: error,
//         key: "description-generation",
//         duration: 3,
//       });
//     }
//   }, [selectedFiles]);

//   const gradeCode = useCallback(async () => {
//     setError("");
//     setGradeResult([]);
//     setGradeLoading(true);

//     if (selectedFiles.length === 0) {
//       messageApi.error({
//         content: "Please select at least one file to grade",
//         key: "file-selection",
//         duration: 3,
//       });
//       return;
//     }

//     const validCriterias = criterias.filter(
//       (criteria) => criteria.trim() !== ""
//     );
//     if (validCriterias.length === 0) {
//       messageApi.error({
//         content: "Please add at least one grading criteria",
//         key: "criteria-validation",
//         duration: 3,
//       });
//       return;
//     }

//     try {
//       const response = await apiService.gradeCodeStream(
//         selectedFiles,
//         validCriterias,
//         projectDescription
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const reader = response.body?.getReader();
//       const decoder = new TextDecoder();

//       if (!reader) {
//         throw new Error("Stream reader not available");
//       }

//       messageApi.loading({
//         content: "Grading in progress...",
//         key: "grading",
//         duration: 0,
//       });
//       while (true) {
//         const { done, value } = await reader.read();

//         if (done) {
//           break;
//         }
//         const chunk: GradeResponse = JSON.parse(
//           decoder.decode(value, { stream: true })
//         );
//         if (chunk.type === "noti") {
//           messageApi.loading({
//             content: chunk.output as string,
//             key: "grading",
//             duration: 0,
//           });
//         } else if (chunk.type === "final") {
//           setGradeResult(chunk.output as GradingResult[]);
//         }
//       }

//       messageApi.success({
//         content: "Code graded successfully!",
//         key: "grading",
//         duration: 3,
//       });
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "An unexpected error occurred";
//       setError(errorMessage);
//       messageApi.error({
//         content: errorMessage,
//         key: "grading",
//         duration: 3,
//       });
//     } finally {
//       setGradeLoading(false);
//     }
//   }, [selectedFiles, criterias, projectDescription]);

//   useEffect(() => {
//     setSelectedFiles([]);
//   }, [fileTreeData]);

//   return (
//     <>
//       {contextHolder}
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
//         <div className="container mx-auto max-w-6xl">
//           <Header />

//           <RepositoryConfig
//             repoUrl={repoUrl}
//             loading={loading}
//             selectedExtensions={selectedExtensions}
//             onRepoUrlChange={setRepoUrl}
//             onExtensionChange={handleExtensionChange}
//             onFetchFiles={fetchFileTreeData}
//           />
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-red-600">{error}</p>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <Card
//               title={<Title level={4}>File Tree</Title>}
//               className="shadow-sm hover:shadow-md transition-shadow"
//               extra={
//                 selectedFiles.length > 0 && (
//                   <Badge count={selectedFiles.length} color="blue">
//                     <Button
//                       icon={<EyeOutlined />}
//                       onClick={showSelectedFiles}
//                       type="primary"
//                       ghost
//                     >
//                       Selected Files
//                     </Button>
//                   </Badge>
//                 )
//               }
//             >
//               <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
//                 {fileTreeData.length > 0 ? (
//                   <FileTree
//                     nodes={fileTreeData}
//                     onFileSelection={handleFileSelection}
//                   />
//                 ) : (
//                   <div className="h-full flex items-center justify-center text-gray-500">
//                     <p>No files to display. Clone a repository first.</p>
//                   </div>
//                 )}
//               </div>
//             </Card>

//             <Card
//               title={<Title level={4}>Grading Criteria</Title>}
//               className="shadow-sm hover:shadow-md transition-shadow"
//               extra={
//                 <Space>
//                   <Button
//                     type="default"
//                     size="small"
//                     onClick={handleSetFECriteria}
//                   >
//                     Use FE Criteria
//                   </Button>
//                   <Button
//                     type="default"
//                     size="small"
//                     onClick={handleSetBECriteria}
//                   >
//                     Use BE Criteria
//                   </Button>
//                 </Space>
//               }
//             >
//               <div className="flex gap-2 mb-4">
//                 <Input.TextArea
//                   size="large"
//                   value={projectDescription}
//                   onChange={(e) => setProjectDescription(e.target.value)}
//                   placeholder="Enter project description (optional)"
//                   className="!rounded-lg"
//                   rows={4}
//                 />
//                 <Button
//                   onClick={generateDescription}
//                   disabled={selectedFiles.length === 0}
//                 >
//                   Generate
//                 </Button>
//               </div>
//               <div className="space-y-4">
//                 <CriteriaInput
//                   criterias={criterias}
//                   setCriterias={setCriterias}
//                 />
//                 <Button
//                   type="primary"
//                   size="large"
//                   className="w-full !bg-green-500 hover:!bg-green-600 disabled:opacity-50"
//                   onClick={gradeCode}
//                   disabled={
//                     gradeLoading ||
//                     selectedFiles.length === 0 ||
//                     criterias.filter((c) => c.trim() !== "").length === 0
//                   }
//                   loading={gradeLoading}
//                 >
//                   {gradeLoading ? "Grading Code..." : "Grade Selected Files"}
//                 </Button>
//               </div>
//             </Card>
//           </div>

//           {/* Drawer for selected files */}
//           <Drawer
//             title={
//               <div className="flex items-center">
//                 <FileOutlined className="mr-2" />
//                 <span>Selected Files ({selectedFiles.length})</span>
//               </div>
//             }
//             placement="right"
//             onClose={closeFilesDrawer}
//             open={isFilesDrawerOpen}
//             width={400}
//           >
//             {selectedFiles.length > 0 ? (
//               <ul className="list-disc pl-5 space-y-2">
//                 {selectedFiles.map((file) => (
//                   <li
//                     key={file}
//                     className="text-gray-700 py-1 border-b border-gray-100"
//                   >
//                     {file}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <p className="text-gray-500">No files selected</p>
//               </div>
//             )}
//           </Drawer>

//           {gradeResult && <GradingResultView results={gradeResult} />}
//         </div>
//         <FloatButton.BackTop />
//       </div>
//     </>
//   );
// };

// export default App;
