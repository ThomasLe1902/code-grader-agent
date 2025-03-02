import React, { useState } from "react";
import { Modal, Button, Table, Tag, Tabs } from "antd";
import { marked } from "marked";
import { GradingResult } from "../../types";

type StatusConfig = {
  [key: number]: {
    text: string;
    color: string;
  };
};

const statusConfig: StatusConfig = {
  1: { text: "BAD", color: "red" },
  2: { text: "ACCEPTABLE", color: "orange" },
  3: { text: "NOT RELATED", color: "warning" },
  4: { text: "PERFECT", color: "green" },
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
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

  // Create tab items from the results array
  const tabItems = results.map((result, index) => {
    return {
      key: index.toString(),
      label: `Result ${index + 1}`,
      children: (
        <div>
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
