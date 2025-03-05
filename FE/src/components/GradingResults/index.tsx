import React, { useState } from "react";
import { Modal, Button, Table, Tag, Tabs, Tooltip } from "antd";
import { marked } from "marked";
import { GradingResult } from "../../types";
import * as XLSX from "xlsx";
import { DownloadOutlined } from "@ant-design/icons";

type Status = {
  text: string;
  color: string;
  description: string;
};
type StatusConfig = {
  [key: number]: Status;
};
const statusConfig: StatusConfig = {
  1: {
    text: "Poor",
    color: "red",
    description: "Major issues, fails multiple criteria",
  },
  2: {
    text: "Below Average",
    color: "volcano",
    description: "Significant improvements needed",
  },
  3: {
    text: "Average",
    color: "orange",
    description: "Meets minimum standards",
  },
  4: {
    text: "Good",
    color: "green",
    description: "Minor issues only",
  },
  5: {
    text: "Excellent",
    color: "cyan",
    description: "Meets or exceeds all criteria",
  },
};

const GradingResultView: React.FC<{ results: GradingResult[] }> = ({
  results,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file_name: string;
    comment: string;
    criteria_eval: string;
  } | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>("0");

  const handleViewDetails = (fileResult: {
    file_name: string;
    comment: string;
    criteria_eval: string;
  }) => {
    setSelectedFile(fileResult);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "file_name",
      key: "file_name",
      render: (text: string) => text.split("/").pop(),
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
      render: (_: any, record: any) => (
        <Button type="primary" onClick={() => handleViewDetails(record)}>
          View Details
        </Button>
      ),
    },
  ];

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    results.forEach((currentResults, index) => {
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

  const tabItems = results.map((result, index) => {
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
          {result.grade_criteria && (
            <div className="border rounded-lg bg-white p-6 shadow-sm mt-6">
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
      ),
    };
  });

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Grading Results</h3>

      {results.length > 0 ? (
        <>
          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            type="card"
            items={tabItems}
          />

          {selectedFile && (
            <Modal
              title={selectedFile.file_name.split("/").pop()}
              open={isModalVisible}
              onCancel={handleCancel}
              footer={[
                <Button key="back" onClick={handleCancel}>
                  Close
                </Button>,
              ]}
            >
              <div className="font-medium text-xl">Comments</div>
              <p>{selectedFile.comment || "No comments available."}</p>
              <div className="font-medium text-xl">Evaluation</div>
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(selectedFile.criteria_eval),
                }}
              />
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
