export interface TreeNode {
  label: string;
  value: string;
  children?: TreeNode[];
}

export interface FileResult {
  file_name: string;
  comment: string;
  criteria_eval: string;
}

export interface GradingResult {
  selected_files: string[];
  criterias: string;
  analyze_code_result: FileResult[];
  grade_criteria: string;
}

export interface FileTreeProps {
  nodes: TreeNode[];
  onFileSelection: (selectedFiles: string[]) => void;
}
