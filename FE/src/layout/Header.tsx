import { Typography } from "antd";
import { CodeOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Header: React.FC = () => (
  <header className="text-center mb-8">
    <Title level={1} className="!text-4xl !text-blue-600 mb-2">
      <CodeOutlined className="mr-2" />
      Code Grading Assistant
    </Title>
    <p className="text-gray-600">Analyze and grade your code with AI</p>
  </header>
);

export default Header;