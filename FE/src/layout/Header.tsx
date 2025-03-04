import { Typography } from "antd";
import {
  CodeOutlined,
  RobotOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const Header: React.FC = () => (
  <header className="mb-6 relative">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 shadow-md text-center flex items-center justify-between">
      <div className="flex items-center ml-4">
        <div className="bg-white p-2 rounded-full shadow-sm mr-3">
          <CodeOutlined className="text-xl text-blue-600" />
        </div>
        <Title level={3} className="!text-white !font-bold !m-0">
          Code Grading Assistant
        </Title>
      </div>

      <p className="text-blue-100 hidden sm:block mx-4">
        Analyze and grade your code with advanced AI
      </p>

      <div className="flex space-x-4 mr-4">
        <div className="flex items-center text-white text-sm md:flex">
          <RobotOutlined className="mr-1" />
          <span>AI-Powered</span>
        </div>
        <div className="flex items-center text-white text-sm">
          <CheckCircleOutlined className="mr-1" />
          <span>Instant Feedback</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
