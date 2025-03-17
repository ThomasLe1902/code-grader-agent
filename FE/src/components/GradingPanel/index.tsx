import { Card, Typography, Space, Button, Input } from "antd";
import CriteriaInput from "../CriteriaInput";

const { Title } = Typography;

interface GradingPanelProps {
  criteria: string[];
  setCriteria: React.Dispatch<React.SetStateAction<string[]>>;
  folderCriteria: string;
  setFolderCriteria: React.Dispatch<React.SetStateAction<string>>;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  onGenerateDescription: () => void;
  onGradeCode: () => void;
  onLoadFrontendCriteria: () => void;
  onLoadBackendCriteria: () => void;
  isGenerateDisabled: boolean;
  isGradeDisabled: boolean;
  gradeLoading: boolean;
}

const GradingPanel: React.FC<GradingPanelProps> = ({
  criteria,
  setCriteria,
  folderCriteria,
  setFolderCriteria,
  projectDescription,
  setProjectDescription,
  onGenerateDescription,
  onGradeCode,
  onLoadFrontendCriteria,
  onLoadBackendCriteria,
  isGenerateDisabled,
  isGradeDisabled,
  gradeLoading,
}) => {
  return (
    <Card
      title={<Title level={4}>Grading Criteria</Title>}
      className="shadow-sm hover:shadow-md transition-shadow"
      extra={
        <Space>
          <Button type="default" size="small" onClick={onLoadFrontendCriteria}>
            Use FE Criteria
          </Button>
          <Button type="default" size="small" onClick={onLoadBackendCriteria}>
            Use BE Criteria
          </Button>
        </Space>
      }
    >
      <div className="flex gap-2 mb-4">
        <Input.TextArea
          size="large"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Enter project description (optional)"
          className="!rounded-lg"
          rows={4}
        />
        <Button onClick={onGenerateDescription} disabled={isGenerateDisabled}>
          Generate
        </Button>
      </div>
      <div className="space-y-4">
        <CriteriaInput
          criterias={criteria}
          folderCriteria={folderCriteria}
          setFolderCriteria={setFolderCriteria}
          setCriterias={
            setCriteria as React.Dispatch<React.SetStateAction<string[]>>
          }
        />
        <Button
          type="primary"
          size="large"
          className="w-full !bg-green-500 hover:!bg-green-600 disabled:opacity-50"
          onClick={onGradeCode}
          disabled={isGradeDisabled}
          loading={gradeLoading}
        >
          {gradeLoading ? "Grading Code..." : "Grade Selected Files"}
        </Button>
      </div>
    </Card>
  );
};

export default GradingPanel;
