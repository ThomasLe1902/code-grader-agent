import { useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { GradingResult, TreeNode } from '../types';

export const useGrading = () => {
  const [fileTreeData, setFileTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [criterias, setCriterias] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [error, setError] = useState('');
  const [gradeResult, setGradeResult] = useState<GradingResult | null>(null);

  const fetchFileTree = async (url: string, extensions: string[]) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/get-file-tree/', {
        url,
        extensions,
      });
      setFileTreeData(response.data.file_tree);
    } catch (err) {
      setError('Failed to fetch file tree data');
    } finally {
      setLoading(false);
    }
  };

  const gradeCode = async () => {
    const validCriterias = criterias.filter(criteria => criteria.trim() !== '');
    
    if (selectedFiles.length === 0) {
      message.error('Please select at least one file to grade');
      return;
    }

    if (validCriterias.length === 0) {
      message.error('Please add at least one grading criteria');
      return;
    }

    setGradeLoading(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/grade-code/', {
        selected_files: selectedFiles,
        criterias_list: validCriterias,
      });
      setGradeResult(response.data[0]);
      message.success('Code graded successfully');
    } catch (err) {
      setError('Failed to grade code');
      message.error('Failed to grade code');
    } finally {
      setGradeLoading(false);
    }
  };

  return {
    fileTreeData,
    selectedFiles,
    criterias,
    loading,
    gradeLoading,
    error,
    gradeResult,
    setSelectedFiles,
    setCriterias,
    fetchFileTree,
    gradeCode,
  };
};