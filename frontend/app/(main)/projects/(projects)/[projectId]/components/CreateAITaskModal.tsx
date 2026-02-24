'use client';

import { useState } from 'react';
import { createTaskWithAI } from '../actions';
import { toast } from 'react-toastify';

interface CreateAITaskModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const CreateAITaskModal = ({
  projectId,
  isOpen,
  onClose,
  onSubmit,
}: CreateAITaskModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const maxLength = 1000;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('프롬프트를 입력해주세요.');
      return;
    }
  
    setIsLoading(true);
    try {
      const { success, error } = await createTaskWithAI({
        projectId,
        naturalLanguage: prompt.trim(),
      });
  
      if (success) {
        toast.success(success);
        setPrompt('');
        onSubmit();
        onClose();
      } else {
        toast.error(error || 'AI 할 일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('AI 할 일 생성 오류:', error);
      toast.error('AI 할 일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] overflow-hidden relative border border-gray-100 h-[800px] flex flex-col shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-10">
          <button
            onClick={onClose}
            className="text-gray-800 hover:bg-gray-100 p-2 rounded-full transition"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <div className="flex gap-2">
            <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 flex-1 overflow-y-auto">
          <h1 className="text-[28px] font-bold text-gray-900 mb-8 leading-tight">
            어떤 하루를<br />
            계획하시나요?
          </h1>

          <div className="relative">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
              <label className="block text-sm font-semibold text-gray-500 mb-2">
                프롬프트 입력
              </label>
              <textarea
                value={prompt}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    setPrompt(e.target.value);
                  }
                }}
                className="w-full bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 leading-relaxed h-[320px]"
                placeholder="예: 오늘 할 일을 자유롭게 적어주세요."
                disabled={isLoading}
              />
            </div>
            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
              {prompt.length}/{maxLength}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pb-8 bg-gradient-to-t from-white via-white to-transparent">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-[#3182F6] hover:bg-[#2870db] active:scale-[0.98] text-white text-lg font-bold py-4 rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0 8px 20px -5px rgba(59, 130, 246, 0.4)',
            }}
          >
            {isLoading ? (
              <>
                <span>생성 중...</span>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </>
            ) : (
              <>
                <span>AI 스케줄 생성하기</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAITaskModal;
