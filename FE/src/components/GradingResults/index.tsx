import { marked } from "marked";
import { GradingResult } from "../../types";

const GradingResultView: React.FC<{ result: GradingResult }> = ({ result }) => {
  if (!result || !result.analyze_code_result) {
    return <div className="text-gray-500">No grading results available</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Grading Results</h3>
      <div className="space-y-6">
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
      </div>
    </div>
  );
};
export default GradingResultView;
