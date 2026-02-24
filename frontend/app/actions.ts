'use server';

import ActionResult from '@/types/ActionResult';
import * as api from '@/shared/api';

export const uploadFiles = async (
  files: File[]
): Promise<ActionResult<string[]>> => {
  try {
    if (!files || files.length === 0) {
      return {
        error: '파일이 필요합니다',
        success: null,
        data: null,
      };
    }

    const urls = await api.uploadFiles(files);
    if (!Array.isArray(urls)) {
      return {
        error: '서버에서 예상하지 못한 응답을 받았습니다.',
        success: null,
        data: null,
      };
    }
    return {
      error: null,
      success: '파일 업로드 성공',
      data: urls,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : '오류가 발생했습니다.',
      success: null,
      data: null,
    };
  }
};
