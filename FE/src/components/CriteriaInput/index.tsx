import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useCallback } from "react";

interface CriteriaInputProps {
  criterias: string[];
  setCriterias: React.Dispatch<React.SetStateAction<string[]>>;
}

const CriteriaInput: React.FC<CriteriaInputProps> = ({
  criterias,
  setCriterias,
}) => {
  const addCriteriaField = useCallback(() => {
    setCriterias((prev) => [...prev, ""]);
  }, [setCriterias]);

  const removeCriteriaField = useCallback(
    (index: number) => {
      setCriterias((prev) => {
        const newCriterias = [...prev];
        newCriterias.splice(index, 1);
        return newCriterias;
      });
    },
    [setCriterias]
  );

  const handleCriteriaChange = useCallback(
    (value: string, index: number) => {
      setCriterias((prev) => {
        const newCriterias = [...prev];
        newCriterias[index] = value;
        return newCriterias;
      });
    },
    [setCriterias]
  );

  return (
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
  );
};

export default CriteriaInput;
