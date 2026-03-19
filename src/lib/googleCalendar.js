import { google } from 'googleapis';

/**
 * Google Calendar Integration for Dishanta MBA Mentorship
 * 
 * Uses a Google Service Account to create calendar events.
 * When a session is booked, it creates a Google Calendar event
 * and sends email invites to both candidate and mentor.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com)
 * 2. Create a project (or use existing)
 * 3. Enable the "Google Calendar API"
 * 4. Go to Credentials → Create Credentials → Service Account
 * 5. Download the JSON key file
 * 6. Copy values from JSON key into .env.local:
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL = client_email from JSON
 *    - GOOGLE_PRIVATE_KEY = private_key from JSON (keep the \n characters)
 *    - GOOGLE_CALENDAR_ID = your calendar ID (usually your Gmail address, or create a dedicated calendar)
 * 7. Share your Google Calendar with the service account email (give "Make changes to events" permission)
 */

/**
 * Get an authenticated Google Calendar client using Service Account
 */
function getCalendarClient() {
    const SCOPES = ['https://www.googleapis.com/auth/calendar'];

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceAccountEmail || !privateKey) {
        console.warn('Google Calendar credentials not configured. Skipping calendar integration.');
        return null;
    }

    const auth = new google.auth.JWT(
        serviceAccountEmail,
        null,
        privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines from env
        SCOPES
    );

    return google.calendar({ version: 'v3', auth });
}

/**
 * Parse session time string (e.g., "10:00 AM") and date to create proper Date objects
 */
function parseSessionDateTime(sessionDate, sessionTime) {
    // sessionDate can be ISO string like "2026-03-20T00:00:00.000Z" or "2026-03-20"
    const datePart = sessionDate.split('T')[0]; // "2026-03-20"

    // sessionTime is like "10:00 AM" or "2:30 PM"
    const timeMatch = sessionTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    
    if (!timeMatch) {
        console.error('Invalid session time format:', sessionTime);
        return null;
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    // Convert to 24h format
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    const [year, month, day] = datePart.split('-').map(Number);

    // Create start and end times (15 min session duration)
    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 minutes later

    return { startDate, endDate };
}

/**
 * Create a Google Calendar event for a booked session
 * 
 * @param {Object} params
 * @param {string} params.candidateName - Name of the candidate
 * @param {string} params.candidateEmail - Email of the candidate
 * @param {string} params.mentorName - Name of the mentor
 * @param {string} params.mentorEmail - Email of the mentor
 * @param {string} params.sessionDate - Session date (ISO string or YYYY-MM-DD)
 * @param {string} params.sessionTime - Session time (e.g., "10:00 AM")
 * @param {string} params.sessionReason - Reason/topic for the session
 * @returns {Object|null} Google Calendar event data or null if failed
 */
export async function createCalendarEvent({
    candidateName,
    candidateEmail,
    mentorName,
    mentorEmail,
    sessionDate,
    sessionTime,
    sessionReason
}) {
    try {
        const calendar = getCalendarClient();
        
        if (!calendar) {
            console.log('Google Calendar client not available. Skipping event creation.');
            return null;
        }

        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
        
        const times = parseSessionDateTime(sessionDate, sessionTime);
        if (!times) {
            console.error('Could not parse session date/time for calendar event.');
            return null;
        }

        const { startDate, endDate } = times;

        // Build the event
        const event = {
            summary: `Dishanta Mentorship: ${candidateName} & ${mentorName}`,
            description: [
                `📋 MBA Mentorship Session`,
                ``,
                `👤 Candidate: ${candidateName}`,
                `📧 Candidate Email: ${candidateEmail}`,
                ``,
                `🎓 Mentor: ${mentorName}`,
                `📧 Mentor Email: ${mentorEmail}`,
                ``,
                `📌 Topic: ${sessionReason}`,
                `⏱️ Duration: 15 Minutes`,
                ``,
                `Join the session from your Dishanta dashboard at the scheduled time.`,
            ].join('\n'),
            start: {
                dateTime: startDate.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            attendees: [
                { email: candidateEmail, displayName: candidateName },
                { email: mentorEmail, displayName: mentorName },
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 60 },    // Email reminder 1 hour before
                    { method: 'popup', minutes: 15 },    // Popup reminder 15 min before
                    { method: 'popup', minutes: 5 },     // Popup reminder 5 min before
                ],
            },
            colorId: '9', // Blueberry color
            status: 'confirmed',
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            resource: event,
            sendUpdates: 'all', // Sends email invitations to all attendees
        });

        console.log('✅ Google Calendar event created:', response.data.htmlLink);
        
        return {
            eventId: response.data.id,
            htmlLink: response.data.htmlLink,
            status: response.data.status,
        };
    } catch (error) {
        console.error('❌ Failed to create Google Calendar event:', error.message);
        
        // Log more details for debugging
        if (error.response) {
            console.error('Google API Error Details:', JSON.stringify(error.response.data, null, 2));
        }
        
        return null;
    }
}
