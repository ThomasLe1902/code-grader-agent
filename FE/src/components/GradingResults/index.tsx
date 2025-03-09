import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Tag, Tabs, Tooltip, message } from "antd";
import { marked } from "marked";
import { GradingResult } from "../../types";
import * as XLSX from "xlsx";
import {
  CheckCircleOutlined,
  CodeOutlined,
  CommentOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { apiService } from "../../api/service";
import { statusConfig } from "../../constant";

const GradingResultView: React.FC<{
  results: GradingResult[];
  setResults?: React.Dispatch<React.SetStateAction<GradingResult[]>>;
}> = ({ results, setResults }) => {
  const [localResults, setLocalResults] = useState<GradingResult[]>(results);
  const [gradeOverall, setGradeOverall] = useState<Record<string, string>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file_name: string;
    comment: string;
    criteria_eval: string;
  } | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>("0");
  const [codeContent, setCodeContent] = useState<string>("");
  const [loadingGrade, setLoadingGrade] = useState<Record<string, boolean>>({});
  console.log(gradeOverall);
  const handleViewDetails = (fileResult: {
    file_name: string;
    comment: string;
    criteria_eval: string;
  }) => {
    setSelectedFile(fileResult);
    setIsModalVisible(true);
    // Reset code content each time the modal opens.
    setCodeContent("");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
    setCodeContent("");
  };

  // New function to call the backend and fetch code content.
  const handleShowCode = async () => {
    if (selectedFile) {
      const { data, error } = await apiService.getCodeContent(
        selectedFile.file_name
      );

      if (data) {
        setCodeContent(data);
      } else if (error) {
        message.error(error);
      }
    }
  };

  const handleRemoveFile = (fileIndex: number) => {
    const currentTabIndex = parseInt(activeTabKey);

    const updatedResults = [...localResults];

    if (
      updatedResults[currentTabIndex] &&
      updatedResults[currentTabIndex].analyze_code_result
    ) {
      updatedResults[currentTabIndex].analyze_code_result = updatedResults[
        currentTabIndex
      ].analyze_code_result.filter((_, index) => index !== fileIndex);

      setLocalResults(updatedResults);
      if (setResults) {
        setResults(updatedResults);
      }

      message.success("File removed successfully");
    }
  };

  const handleGradeOverall = async (criteriaIndex: number) => {
    try {
      setLoadingGrade((prev) => ({ ...prev, [criteriaIndex]: true }));

      if (
        !localResults[criteriaIndex] ||
        !localResults[criteriaIndex].analyze_code_result
      ) {
        message.error("No results available to grade");
        return;
      }

      const response = await apiService.overallGrade(
        localResults[criteriaIndex]
      );
      setGradeOverall((prev) => ({
        ...prev,
        [criteriaIndex]: response.data,
      }));

      message.success("Overall grading completed successfully");
    } catch (error) {
      message.error("Failed to grade overall results");
    } finally {
      setLoadingGrade((prev) => ({ ...prev, [criteriaIndex]: false }));
    }
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "file_name",
      key: "file_name",
      render: (text: string) => text,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => {
        const config = statusConfig[rating];
        return (
          <Tooltip title={config.description}>
            <Tag color={config.color}>{config.text}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any, index: number) => (
        <div className="flex space-x-2">
          <Button type="primary" onClick={() => handleViewDetails(record)}>
            View Details
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            title="Remove file"
            onClick={() => handleRemoveFile(index)}
          />
        </div>
      ),
    },
  ];

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    localResults.forEach((currentResults, index) => {
      if (!currentResults || !currentResults.analyze_code_result) {
        return;
      }
      const data = currentResults.analyze_code_result.map((item) => {
        const fileName = item.file_name.split("/").pop() || item.file_name;
        const ratingText =
          statusConfig[item.rating]?.text || String(item.rating);
        const plainTextEval = item.criteria_eval
          .replace(/<[^>]*>?/gm, "")
          .replace(/\*\*/g, "");

        return {
          "File Name": fileName,
          Rating: ratingText,
          "Rating Value": item.rating,
          Comments: item.comment,
          Evaluation: plainTextEval,
        };
      });
      data.push({
        "File Name": "",
        Rating: "",
        "Rating Value": 0,
        Comments: "",
        Evaluation: "",
      });
      const criteriaDetailsRow = {
        "File Name": "Grading Criteria",
        Rating: "",
        "Rating Value": 0,
        Comments: currentResults.grade_criteria
          ? currentResults.grade_criteria
              .replace(/\*\*/g, "")
              .replace(/#/g, "")
              .replace(/<[^>]*>?/gm, "")
          : "No detailed criteria available",
        Evaluation: "",
      };
      data.push(criteriaDetailsRow);

      // Add overall grading if available
      if (gradeOverall[index]) {
        const overallGradeRow = {
          "File Name": "Overall Grade",
          Rating: "",
          "Rating Value": 0,
          Comments: gradeOverall[index]
            .replace(/\*\*/g, "")
            .replace(/#/g, "")
            .replace(/<[^>]*>?/gm, ""),
          Evaluation: "",
        };
        data.push(overallGradeRow);
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const wscols = [
        { wch: 30 },
        { wch: 15 },
        { wch: 10 },
        { wch: 40 },
        { wch: 60 },
      ];

      worksheet["!cols"] = wscols;

      if (worksheet["!rows"]) {
        worksheet["!rows"][data.length - 2] = {
          hpt: 10,
          hpx: 10,
        };

        worksheet["!rows"][data.length - 1] = {
          hpt: 30,
          hpx: 30,
        };
      }

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        `Criteria ${index + 1}`
      );
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `grading_results_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    setLocalResults(results);
  }, [results]);

  const tabItems = localResults.map((result, index) => {
    const currentIndex = index;
    return {
      key: index.toString(),
      label: `Criteria ${index + 1}`,
      children: (
        <div>
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
            >
              Export to Excel
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={result.analyze_code_result}
            rowKey="file_name"
            pagination={false}
          />
          <Button
            type="primary"
            className="bg-green-700 mt-4"
            loading={loadingGrade[currentIndex]}
            onClick={() => handleGradeOverall(currentIndex)}
            disabled={
              !result.analyze_code_result ||
              result.analyze_code_result.length === 0
            }
          >
            Grade Overall Result
          </Button>
          {gradeOverall[currentIndex] && (
            <div className="border rounded-lg bg-white p-6 shadow-sm mt-6">
              <h4 className="text-xl font-semibold text-blue-600 mb-4">
                Overall Grade Analysis
              </h4>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: marked(gradeOverall[currentIndex]),
                }}
              />
            </div>
          )}
        </div>
      ),
    };
  });

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Grading Results</h3>

      {localResults.length > 0 ? (
        <>
          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            type="card"
            items={tabItems}
          />

          {selectedFile && (
            <Modal
              title={
                <div className="flex items-center space-x-2 text-lg">
                  <FileOutlined className="text-blue-500" />
                  <span className="font-semibold">
                    {selectedFile.file_name}
                  </span>
                </div>
              }
              open={isModalVisible}
              onCancel={handleCancel}
              width="90%"
              style={{ top: 20 }}
              className="code-review-modal"
              footer={[
                <Button
                  key="showCode"
                  type="primary"
                  icon={<CodeOutlined />}
                  onClick={handleShowCode}
                  disabled={codeContent ? true : false}
                  className="!bg-blue-500 hover:!bg-blue-600"
                >
                  View Source Code
                </Button>,
                <Button
                  key="remove"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const fileIndex = localResults[
                      parseInt(activeTabKey)
                    ]?.analyze_code_result.findIndex(
                      (file) => file.file_name === selectedFile?.file_name
                    );

                    if (fileIndex !== undefined && fileIndex !== -1) {
                      handleRemoveFile(fileIndex);
                      handleCancel(); 
                    }
                  }}
                >
                  Remove File
                </Button>,
                <Button key="back" onClick={handleCancel}>
                  Close
                </Button>,
              ]}
            >
              <div className="flex flex-col space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <CommentOutlined className="text-green-500 text-xl" />
                      <h3 className="font-semibold text-xl">Comments</h3>
                    </div>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: marked(selectedFile.comment),
                      }}
                    />
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4 ">
                      <CheckCircleOutlined className="text-blue-500 text-xl" />
                      <h3 className="font-semibold text-xl">Evaluation</h3>
                    </div>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: marked(selectedFile.criteria_eval),
                      }}
                    />
                  </div>
                </div>

                {codeContent && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <CodeOutlined className="text-purple-500 text-xl" />
                      <h3 className="font-semibold text-xl">Source Code</h3>
                    </div>
                    <pre
                      className="w-full overflow-x-auto bg-gray-50 rounded-lg"
                      style={{
                        padding: "1.25rem",
                        maxHeight: "600px",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      }}
                    >
                      <code>{codeContent}</code>
                    </pre>
                  </div>
                )}
              </div>
            </Modal>
          )}
        </>
      ) : (
        <p>No grading results available.</p>
      )}
    </div>
  );
};

export default GradingResultView;
