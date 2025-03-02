import { Input, Select, Button, Card } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { EXTENSION_OPTIONS } from "../../constant";

interface RepositoryConfigProps {
  repoUrl: string;
  loading: boolean;
  selectedExtensions: string[];
  onRepoUrlChange: (url: string) => void;
  onExtensionChange: (extensions: string[]) => void;
  onFetchFiles: () => void;
}

const RepositoryConfig: React.FC<RepositoryConfigProps> = ({
  repoUrl,
  loading,
  selectedExtensions,
  onRepoUrlChange,
  onExtensionChange,
  onFetchFiles,
}) => (
  <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="space-y-4">
      <Input
        size="large"
        value={repoUrl}
        onChange={(e) => onRepoUrlChange(e.target.value)}
        placeholder="Enter GitHub repository URL"
        className="!rounded-lg"
      />
      <Select
        size="large"
        mode="multiple"
        className="w-full"
        placeholder="Select file extensions"
        onChange={onExtensionChange}
        options={EXTENSION_OPTIONS}
        defaultValue={selectedExtensions}
      />
      <Button
        type="primary"
        size="large"
        icon={<CloudDownloadOutlined />}
        onClick={onFetchFiles}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600"
      >
        {loading ? "Cloning Repository..." : "Clone Repository"}
      </Button>
    </div>
  </Card>
);

export default RepositoryConfig;