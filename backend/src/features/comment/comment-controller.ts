import { Request, Response } from "express";
import prisma from "../../shared/utils/prisma.js";

// 1. 댓글 등록
export const createComment = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { content } = req.body;

  // 400 Bad Request: 내용이 없는 경우
  if (!content || typeof content !== "string") {
    return res.status(400).json({ message: "잘못된 요청 형식" });
  }

  const user = (req as any).user;
  const userId = user.userId || user.id;

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        taskId: Number(taskId),
        userId: Number(userId),
      },
      // 요구사항의 author 구조를 위해 유저 정보 포함
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // 요구사항 스펙에 맞게 응답 구조 재구성 (userId 필드 제외 및 user -> author 변경)
    const { userId: _, user: author, ...commentData } = newComment;

    res.status(200).json({
      ...commentData,
      author,
    });
  } catch (error) {
    // 403 Forbidden: 프로젝트 멤버 체크 로직이 필요할 경우 여기서 처리
    // 현재는 단순 에러 핸들링
    res.status(500).json({ message: "댓글 등록 실패", error });
  }
};

// 2. 댓글 목록 조회
export const getCommentsByTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: Number(taskId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedData = comments.map(
      ({ userId: _, user: author, ...commentData }) => ({
        ...commentData,
        author,
      }),
    );

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "조회 실패", error });
  }
};

// 3. 댓글 수정
export const updateComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ message: "잘못된 요청 형식" });
  }

  const user = (req as any).user;
  const userId = user.userId || user.id;

  try {
    // 1. 먼저 댓글이 존재하는지, 작성자가 맞는지 확인
    const existingComment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!existingComment) {
      return res.status(404).send(); // 요구사항: 404는 (없음)
    }

    if (existingComment.userId !== Number(userId)) {
      return res
        .status(403)
        .json({ message: "자신이 작성한 댓글만 수정할 수 있습니다" });
    }

    // 2. 댓글 수정 및 수정된 데이터(author 포함) 가져오기
    const updatedComment = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // 3. 응답 스펙 맞추기 (user -> author)
    const { userId: _, user: author, ...commentData } = updatedComment;

    res.status(200).json({
      ...commentData,
      author,
    });
  } catch (error) {
    res.status(500).json({ message: "수정 실패", error });
  }
};

// 4. 댓글 삭제
export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const user = (req as any).user;
  const userId = user.userId || user.id;

  try {
    // 1. 존재 여부 및 작성자 확인
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!comment) {
      return res.status(404).send(); // 요구사항: 404는 (없음)
    }

    if (comment.userId !== Number(userId)) {
      return res
        .status(403)
        .json({ message: "자신이 작성한 댓글만 삭제할 수 있습니다" });
    }

    // 2. 삭제 수행
    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });

    // 3. 성공 시 204 No Content
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "삭제 실패", error });
  }
};

// 5. 단일 댓글 조회
export const getCommentById = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // 404 Not Found: 댓글이 없는 경우
    if (!comment) {
      return res.status(404).send(); // 요구사항에 (없음)이라고 되어있으므로 본문 없이 전송
    }

    // 요구사항 스펙에 맞게 데이터 가공 (userId 제외 및 user -> author)
    const { userId: _, user: author, ...commentData } = comment;

    res.status(200).json({
      ...commentData,
      author,
    });
  } catch (error) {
    // ID가 숫자가 아닌 경우 등
    res.status(400).json({ message: "잘못된 요청 형식" });
  }
};
