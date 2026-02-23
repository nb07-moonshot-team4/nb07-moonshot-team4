import { google } from 'googleapis';
import prisma from '../../shared/utils/prisma.js';

async function getGoogleCalendarAuth(userId: number) {
  const authProvider = await prisma.userAuthProvider.findUnique({
    where: {
      provider_providerUserId: {
        provider: 'google_calendar',
        providerUserId: userId.toString()
      }
    }
  });

  if (!authProvider || !authProvider.accessToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: authProvider.accessToken,
    refresh_token: authProvider.refreshToken,
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.userAuthProvider.update({
        where: { id: authProvider.id },
        data: {
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token || authProvider.accessToken,
        }
      });
    }
  });

  return oauth2Client;
}

export async function createCalendarEvent(
  userId: number,
  taskId: number,
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string
) {
  try {
    const auth = await getGoogleCalendarAuth(userId);
    if (!auth) {
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Asia/Seoul',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    await prisma.task.update({
      where: { id: taskId },
      data: { googleEventId: response.data.id || null }
    });

    return response.data;
  } catch (error: any) {
    console.error('구글 캘린더 이벤트 생성 실패:', error);
    return null;
  }
}

export async function updateCalendarEvent(
  userId: number,
  taskId: number,
  googleEventId: string,
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string
) {
  try {
    const auth = await getGoogleCalendarAuth(userId);
    if (!auth) {
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Asia/Seoul',
      },
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: googleEventId,
      requestBody: event,
    });

    return response.data;
  } catch (error: any) {
    console.error('구글 캘린더 이벤트 업데이트 실패:', error);
    return null;
  }
}

export async function deleteCalendarEvent(
  userId: number,
  googleEventId: string
) {
  try {
    const auth = await getGoogleCalendarAuth(userId);
    if (!auth) {
      return;
    }

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
    });
  } catch (error: any) {
    console.error('구글 캘린더 이벤트 삭제 실패:', error);
  }
}
