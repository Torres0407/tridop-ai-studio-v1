import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private configService: ConfigService) {}

  async sync(userId: string, events: any[]) {
    const credentialsStr = this.configService.get<string>('GOOGLE_CALENDAR_CREDENTIALS');
    if (!credentialsStr) {
      this.logger.error('GOOGLE_CALENDAR_CREDENTIALS not configured');
      throw new Error('Google Calendar integration is not configured');
    }

    const credentials = JSON.parse(credentialsStr);
    const auth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris?.[0]
    );

    // In a real flow, the user's refresh token would be fetched from the DB here
    const userRefreshToken = this.configService.get<string>(`USER_REFRESH_TOKEN_${userId}`);
    if (!userRefreshToken) {
      throw new Error('User has not authorized Google Calendar');
    }

    auth.setCredentials({ refresh_token: userRefreshToken });

    const calendar = google.calendar({ version: 'v3', auth });

    this.logger.log(`Syncing ${events.length} events for user ${userId}`);
    
    // Example implementation: insert events
    const results = [];
    for (const event of events) {
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          start: { dateTime: event.start },
          end: { dateTime: event.end },
        },
      });
      results.push(res.data);
    }

    return results;
  }
}
