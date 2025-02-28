import React, { useState } from "react";
import axios from "axios";
import { Button, Input, Select, message } from "antd";
import { GoFileDirectoryFill } from "react-icons/go";
import { CiFileOn } from "react-icons/ci";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { marked } from "marked";
import "./components/GradingResults/style.css";

// TypeScript interface for a tree node
interface TreeNode {
  label: string;
  value: string;
  children?: TreeNode[];
}

// Interface for grading result
interface GradingResult {
  selected_files: string[];
  criterias: string;
  analyze_code_result: Array<{
    file_name: string;
    comment: string;
    criteria_eval: string;
  }>;
  grade_criteria: string;
}

interface FileTreeProps {
  nodes: TreeNode[];
  onFileSelection: (selectedFiles: string[]) => void; // Pass selected files to parent component
}

const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelection }) => {
  const [openNodes, setOpenNodes] = useState<string[]>([]);
  const [checkedNodes, setCheckedNodes] = useState<string[]>([]);

  const toggleNode = (value: string) => {
    setOpenNodes((prev) =>
      prev.includes(value)
        ? prev.filter((node) => node !== value)
        : [...prev, value]
    );
  };

  const toggleCheck = (node: TreeNode) => {
    const value = node.value;
    const isChecked = checkedNodes.includes(value);

    if (isChecked) {
      const newCheckedNodes = checkedNodes.filter((v) => v !== value);
      setCheckedNodes(newCheckedNodes);
      updateSelectedFiles(newCheckedNodes);
    } else {
      // Add node and its children to checkedNodes
      const newCheckedNodes = [...checkedNodes, value];
      if (node.children) {
        node.children.forEach((child) => newCheckedNodes.push(child.value));
      }
      setCheckedNodes(newCheckedNodes);
      updateSelectedFiles(newCheckedNodes);
    }
  };

  // Update selected files in parent component
  const updateSelectedFiles = (selectedFiles: string[]) => {
    onFileSelection(selectedFiles);
  };

  const renderTree = (node: TreeNode) => {
    const isOpen = openNodes.includes(node.value);
    const isChecked = checkedNodes.includes(node.value);

    const isDirectory = !!node.children;

    return (
      <li key={node.value} style={{ listStyle: "none", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => toggleCheck(node)}
          />
          <span
            style={{
              marginLeft: "8px",
              cursor: "pointer",
              color: isDirectory ? "blue" : "green",
              fontWeight: isDirectory ? "bold" : "normal",
            }}
            onClick={() => isDirectory && toggleNode(node.value)}
          >
            <div className="flex items-center">
              {isDirectory ? (
                isOpen ? (
                  <GoFileDirectoryFill />
                ) : (
                  "📁"
                )
              ) : (
                <CiFileOn />
              )}
              {node.label}
            </div>
          </span>
        </div>

        {isDirectory && isOpen && (
          <ul style={{ paddingLeft: "20px" }}>
            {node.children!.map((child) => renderTree(child))}
          </ul>
        )}
      </li>
    );
  };

  return <ul>{nodes.map((node) => renderTree(node))}</ul>;
};

// GradingResultView component
const GradingResultView: React.FC<{ result: GradingResult }> = ({ result }) => {
  // Add check for result and analyze_code_result
  if (!result || !result.analyze_code_result) {
    return <div>No grading results available</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Grading Results</h3>
      <div className="space-y-6">
        {result.analyze_code_result.map((fileResult, index) => (
          <div key={index} className="border rounded-lg bg-white p-6 shadow-sm">
            <h4 className="text-xl font-semibold text-blue-600 mb-4">
              {fileResult.file_name.split("/").pop()}
            </h4>

            <div className="mb-4">
              <h5 className="text-lg font-medium text-gray-700 mb-2">
                Overview
              </h5>
              <p className="text-gray-600 whitespace-pre-wrap">
                {fileResult.comment}
              </p>
            </div>

            <div>
              <h5 className="text-lg font-medium text-gray-700 mb-2">
                Detailed Evaluation
              </h5>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: marked(fileResult.criteria_eval),
                }}
              />
            </div>
          </div>
        ))}

        {result.grade_criteria && (
          <div className="border rounded-lg bg-white p-6 shadow-sm">
            <h4 className="text-xl font-semibold text-blue-600 mb-4">
              Overall Grade Criteria
            </h4>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: marked(result.grade_criteria),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/tharain/react-tree-file-system"
  );
  const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [criterias, setCriterias] = useState<string[]>([""]); // Start with one empty criteria
  const [loading, setLoading] = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [error, setError] = useState("");
  const [gradeResult, setGradeResult] = useState<GradingResult | null>(null);

  const extensionOptions = [
    { label: "Python", value: ".py" },
    { label: "JavaScript", value: ".js" },
    { label: "TypeScript", value: ".ts" },
    { label: "HTML", value: ".html" },
    { label: "CSS", value: ".css" },
    { label: "TSX", value: ".tsx" },
    { label: "Java", value: ".java" },
    { label: "CPP", value: ".cpp" },
    { label: "C", value: ".c" },
    { label: "Go", value: ".go" },
    { label: "Swift", value: ".swift" },
    { label: "Rust", value: ".rs" },
    { label: "Kotlin", value: ".kt" },
    { label: "PHP", value: ".php" },
    { label: "CSharp", value: ".cs" },
  ];
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(
    extensionOptions.map((option) => option.value)
  );
  const fetchFileTreeData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/get-file-tree/",
        {
          url: repoUrl,
          extensions: selectedExtensions,
        }
      );
      setFileTreeData(response.data.file_tree);
    } catch (err) {
      setError("Failed to fetch file tree data");
    } finally {
      setLoading(false);
    }
  };

  const handleExtensionChange = (value: string[]) => {
    setSelectedExtensions(value);
  };

  const handleFileSelection = (files: string[]) => {
    setSelectedFiles(files);
  };

  const addCriteriaField = () => {
    setCriterias([...criterias, ""]);
  };

  const removeCriteriaField = (index: number) => {
    const newCriterias = [...criterias];
    newCriterias.splice(index, 1);
    setCriterias(newCriterias);
  };

  const handleCriteriaChange = (value: string, index: number) => {
    const newCriterias = [...criterias];
    newCriterias[index] = value;
    setCriterias(newCriterias);
  };

  const gradeCode = async () => {
    // Filter out empty criteria
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
    try {
      const response = await axios.post("http://127.0.0.1:8000/grade-code/", {
        selected_files: selectedFiles,
        criterias_list: validCriterias,
      });
      // The API returns an array, but we need the first item
      setGradeResult(response.data[0]);
      message.success("Code graded successfully");
    } catch (err) {
      setError("Failed to grade code");
      message.error("Failed to grade code");
    } finally {
      setGradeLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="font-bold text-blue-400 text-3xl mb-6">Grade Code</div>
      <div className="mb-6">
        <Input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter GitHub repository URL"
          className="mb-4"
        />
        <Select
          mode="multiple"
          className="w-full mb-4"
          placeholder="Select extensions"
          onChange={handleExtensionChange}
          options={extensionOptions}
          defaultValue={selectedExtensions}
        />
        <Button
          type="primary"
          onClick={fetchFileTreeData}
          disabled={loading}
          className="mb-4"
        >
          {loading ? "Loading..." : "Clone"}
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">File Tree:</h3>
          <div className="border rounded p-4 bg-gray-50 min-h-64">
            {fileTreeData.length > 0 ? (
              <FileTree
                nodes={fileTreeData}
                onFileSelection={handleFileSelection}
              />
            ) : (
              <p className="text-gray-500">
                No files to display. Clone a repository first.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Grading Criteria:</h3>
          <div className="border rounded p-4 bg-gray-50">
            {criterias.map((criteria, index) => (
              <div key={index} className="flex items-center mb-3">
                <Input.TextArea
                  value={criteria}
                  onChange={(e) => handleCriteriaChange(e.target.value, index)}
                  placeholder={`Enter criteria ${index + 1}`}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  className="flex-grow mr-2"
                />
                {criterias.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<MinusOutlined />}
                    onClick={() => removeCriteriaField(index)}
                  />
                )}
                {index === criterias.length - 1 && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={addCriteriaField}
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            type="primary"
            className="mt-4 bg-green-500"
            onClick={gradeCode}
            disabled={gradeLoading || selectedFiles.length === 0}
          >
            {gradeLoading ? "Grading..." : "Grade Code"}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Selected Files:</h3>
        <div className="border rounded p-4 bg-gray-50">
          {selectedFiles.length > 0 ? (
            <ul className="list-disc pl-5">
              {selectedFiles.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No files selected</p>
          )}
        </div>
      </div>

      {/* Use the GradingResultView component to display results */}
      {gradeResult && <GradingResultView result={gradeResult} />}
    </div>
  );
};

export default App;
