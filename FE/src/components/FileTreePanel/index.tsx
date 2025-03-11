import { useState } from "react";
import { Card, Typography, Badge, Button, Drawer } from "antd";
import { EyeOutlined, FileOutlined } from "@ant-design/icons";
import { TreeNode } from "../../types";
import FileTree from "../FileTree";

const { Title } = Typography;

interface FileTreePanelProps {
  fileTreeData: TreeNode[];
  selectedFiles: string[];
  onFileSelection: (files: string[]) => void;
}

const FileTreePanel: React.FC<FileTreePanelProps> = ({
  fileTreeData,
  selectedFiles,
  onFileSelection,
}) => {
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);

  const showSelectedFiles = () => {
    setIsFilesDrawerOpen(true);
  };

  const closeFilesDrawer = () => {
    setIsFilesDrawerOpen(false);
  };

  return (
    <>
      <Card
        title={<Title level={4}>File Tree</Title>}
        className="shadow-sm hover:shadow-md transition-shadow"
        extra={
          selectedFiles.length > 0 && (
            <Badge count={selectedFiles.length} color="blue">
              <Button
                icon={<EyeOutlined />}
                onClick={showSelectedFiles}
                type="primary"
                ghost
              >
                Selected Files
              </Button>
            </Badge>
          )
        }
      >
        <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
          {fileTreeData.length > 0 ? (
            <FileTree nodes={fileTreeData} onFileSelection={onFileSelection} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>No files to display. Clone a repository first.</p>
            </div>
          )}
        </div>
      </Card>

      <Drawer
        title={
          <div className="flex items-center">
            <FileOutlined className="mr-2" />
            <span>Selected Files ({selectedFiles.length})</span>
          </div>
        }
        placement="right"
        onClose={closeFilesDrawer}
        open={isFilesDrawerOpen}
        width={400}
      >
        {selectedFiles.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {selectedFiles.map((file) => (
              <li
                key={file}
                className="text-gray-700 py-1 border-b border-gray-100"
              >
                {file}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No files selected</p>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default FileTreePanel;
