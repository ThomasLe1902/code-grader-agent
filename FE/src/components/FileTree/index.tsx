import { useCallback, useState } from "react";
import { FileTreeProps, TreeNode } from "../../types";
import { GoFileDirectoryFill } from "react-icons/go";
import { CiFileOn } from "react-icons/ci";

const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelection }) => {
    const [openNodes, setOpenNodes] = useState<string[]>([]);
    const [checkedNodes, setCheckedNodes] = useState<string[]>([]);
  
    const toggleNode = (value: string) => {
      setOpenNodes((prev) =>
        prev.includes(value)
          ? prev.filter((node) => node !== value)
          : [...prev, value]
      );
    };
  
    const toggleCheck = useCallback((node: TreeNode) => {
      const value = node.value;
      
      setCheckedNodes((prevChecked) => {
        const isChecked = prevChecked.includes(value);
        let newCheckedNodes: string[];
        
        if (isChecked) {
          // Remove node from checked nodes
          newCheckedNodes = prevChecked.filter((v) => v !== value);
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
        
        // Update parent component
        onFileSelection(newCheckedNodes);
        return newCheckedNodes;
      });
    }, [onFileSelection]);
  
    const renderTree = useCallback((node: TreeNode) => {
      const isOpen = openNodes.includes(node.value);
      const isChecked = checkedNodes.includes(node.value);
      const isDirectory = !!node.children;
  
      return (
        <li key={node.value} className="list-none mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleCheck(node)}
              className="mr-2"
            />
            <span
              className={`cursor-pointer ${isDirectory ? 'text-blue-600 font-semibold' : 'text-green-600'}`}
              onClick={() => isDirectory && toggleNode(node.value)}
            >
              <div className="flex items-center">
                {isDirectory ? (
                  isOpen ? <GoFileDirectoryFill className="mr-1" /> : <span className="mr-1">📁</span>
                ) : (
                  <CiFileOn className="mr-1" />
                )}
                {node.label}
              </div>
            </span>
          </div>
  
          {isDirectory && isOpen && (
            <ul className="pl-5 mt-1">
              {node.children!.map((child) => renderTree(child))}
            </ul>
          )}
        </li>
      );
    }, [openNodes, checkedNodes, toggleCheck]);
  
    return <ul>{nodes.map((node) => renderTree(node))}</ul>;
  };
  export default FileTree;