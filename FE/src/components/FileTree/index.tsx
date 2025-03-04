import { useCallback, useState, useEffect } from "react";
import { FileTreeProps, TreeNode } from "../../types";
import { FaFolderOpen, FaFolder, FaFile } from "react-icons/fa";

const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelection }) => {
  const [openNodes, setOpenNodes] = useState<string[]>([]);
  const [checkedNodes, setCheckedNodes] = useState<string[]>([]);

  const toggleNode = (value: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setOpenNodes((prev) =>
      prev.includes(value)
        ? prev.filter((node) => node !== value)
        : [...prev, value]
    );
  };

  const toggleCheck = useCallback((node: TreeNode, event?: React.ChangeEvent) => {
    event?.stopPropagation();
    const value = node.value;
    
    setCheckedNodes((prevChecked) => {
      const isChecked = prevChecked.includes(value);
      let newCheckedNodes: string[];
      
      if (isChecked) {
        // Remove node from checked nodes
        newCheckedNodes = prevChecked.filter((v) => v !== value);
        
        // Remove all children recursively when parent is unchecked
        if (node.children) {
          const removeAllChildren = (children: TreeNode[]) => {
            children.forEach(child => {
              newCheckedNodes = newCheckedNodes.filter(v => v !== child.value);
              if (child.children) {
                removeAllChildren(child.children);
              }
            });
          };
          
          removeAllChildren(node.children);
        }
      } else {
        // Add node and its children to checked nodes
        newCheckedNodes = [...prevChecked, value];
        
        // Add all children recursively
        if (node.children) {
          const addAllChildren = (children: TreeNode[]) => {
            children.forEach(child => {
              if (!newCheckedNodes.includes(child.value)) {
                newCheckedNodes.push(child.value);
                if (child.children) {
                  addAllChildren(child.children);
                }
              }
            });
          };
          
          addAllChildren(node.children);
        }
      }
      
      return newCheckedNodes;
    });
  }, []);

  // Update parent component whenever checkedNodes changes
  useEffect(() => {
    onFileSelection(checkedNodes);
  }, [checkedNodes, onFileSelection]);

  const renderTree = useCallback((node: TreeNode) => {
    const isOpen = openNodes.includes(node.value);
    const isChecked = checkedNodes.includes(node.value);
    const isDirectory = !!node.children;

    return (
      <li key={node.value} className="list-none mb-2">
        <div 
          className={`flex items-center p-2 rounded-md transition-all hover:bg-blue-50 ${isChecked ? 'bg-blue-50' : ''}`}
          onClick={() => isDirectory && toggleNode(node.value)}
        >
          <div className="flex items-center flex-grow">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => toggleCheck(node, e)}
              className="mr-3 h-4 w-4 accent-blue-500 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            
            <span className={`cursor-pointer flex items-center ${isDirectory ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
              {isDirectory ? (
                isOpen ? (
                  <FaFolderOpen className="mr-2 text-lg text-amber-500" />
                ) : (
                  <FaFolder className="mr-2 text-lg text-amber-400" />
                )
              ) : (
                <FaFile className="mr-2 text-blue-400" />
              )}
              <span className="truncate">{node.label}</span>
            </span>
          </div>
        </div>

        {isDirectory && isOpen && (
          <ul className="pl-6 mt-1 border-l-2 border-blue-100">
            {node.children!.map((child) => renderTree(child))}
          </ul>
        )}
      </li>
    );
  }, [openNodes, checkedNodes, toggleCheck]);

  return (
    <div className="file-tree-container p-2">
      <ul>{nodes.map((node) => renderTree(node))}</ul>
    </div>
  );
};

export default FileTree;