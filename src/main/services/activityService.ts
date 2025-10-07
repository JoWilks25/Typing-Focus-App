/**
 * Activity tracking service for managing typing activities and statistics
 * Tracks keystrokes, pauses, and calculates typing statistics
 */

export interface Activity {
  type: 'typing' | 'pause' | 'resume';
  timestamp: number;
  data?: unknown;
}

export interface ActivityRecord {
  sessionId: string;
  activity: Activity;
  recordedAt: number;
}

export interface ActivityStats {
  totalTypingTime: number;
  totalPauseTime: number;
  keystrokes: number;
  wordsPerMinute: number;
}

export interface ActivitySession {
  sessionId: string;
  activities: ActivityRecord[];
  stats: ActivityStats;
}

export interface ActivityRecordResult {
  success: boolean;
  sessionId: string;
  activityId: string;
}

export interface ActivityStatsResult {
  sessionId: string;
  stats: ActivityStats;
}

export interface ActivityResetResult {
  success: boolean;
  sessionId: string;
}

export class ActivityService {
  private activities: Map<string, ActivityRecord[]> = new Map();
  private pauseStartTimes: Map<string, number> = new Map();

  /**
   * Record an activity for a session
   */
  recordActivity(sessionId: string, activity: Activity): ActivityRecordResult {
    this.validateSessionId(sessionId);
    this.validateActivity(activity);

    const activityRecord: ActivityRecord = {
      sessionId,
      activity,
      recordedAt: Date.now()
    };

    // Get existing activities for this session
    const sessionActivities = this.activities.get(sessionId) || [];
    
    // Handle pause/resume logic
    if (activity.type === 'pause') {
      this.pauseStartTimes.set(sessionId, activity.timestamp);
    } else if (activity.type === 'resume') {
      this.pauseStartTimes.delete(sessionId);
    }

    // Add the new activity
    sessionActivities.push(activityRecord);
    this.activities.set(sessionId, sessionActivities);

    // Generate a unique activity ID
    const activityId = `${sessionId}-${activity.timestamp}-${sessionActivities.length}`;

    return {
      success: true,
      sessionId,
      activityId
    };
  }

  /**
   * Get activity statistics for a session
   */
  getActivityStats(sessionId: string): ActivityStatsResult {
    this.validateSessionId(sessionId);

    const sessionActivities = this.activities.get(sessionId) || [];
    
    if (sessionActivities.length === 0) {
      return {
        sessionId,
        stats: {
          totalTypingTime: 0,
          totalPauseTime: 0,
          keystrokes: 0,
          wordsPerMinute: 0
        }
      };
    }

    const stats = this.calculateStats(sessionActivities);
    
    return {
      sessionId,
      stats
    };
  }

  /**
   * Reset all activities for a session
   */
  resetActivity(sessionId: string): ActivityResetResult {
    this.validateSessionId(sessionId);

    this.activities.delete(sessionId);
    this.pauseStartTimes.delete(sessionId);

    return {
      success: true,
      sessionId
    };
  }

  /**
   * Get all sessions that have activities
   */
  getAllActivitySessions(): ActivitySession[] {
    const sessions: ActivitySession[] = [];

    for (const [sessionId, activities] of this.activities.entries()) {
      const stats = this.calculateStats(activities);
      sessions.push({
        sessionId,
        activities,
        stats
      });
    }

    return sessions;
  }

  /**
   * Clear all activities for all sessions
   */
  clearAllActivities(): void {
    this.activities.clear();
    this.pauseStartTimes.clear();
  }

  /**
   * Get activities for a specific session
   */
  getSessionActivities(sessionId: string): ActivityRecord[] {
    this.validateSessionId(sessionId);
    return this.activities.get(sessionId) || [];
  }

  /**
   * Get total number of activities across all sessions
   */
  getTotalActivityCount(): number {
    let total = 0;
    for (const activities of this.activities.values()) {
      total += activities.length;
    }
    return total;
  }

  /**
   * Calculate statistics from activity records
   */
  private calculateStats(activities: ActivityRecord[]): ActivityStats {
    let totalTypingTime = 0;
    let totalPauseTime = 0;
    let keystrokes = 0;
    let wordsPerMinute = 0;

    if (activities.length === 0) {
      return {
        totalTypingTime: 0,
        totalPauseTime: 0,
        keystrokes: 0,
        wordsPerMinute: 0
      };
    }

    // Count keystrokes
    keystrokes = activities.filter(a => a.activity.type === 'typing').length;

    // Calculate typing time (time between typing events)
    const typingActivities = activities.filter(a => a.activity.type === 'typing');
    if (typingActivities.length > 1) {
      const firstTyping = typingActivities[0].activity.timestamp;
      const lastTyping = typingActivities[typingActivities.length - 1].activity.timestamp;
      totalTypingTime = lastTyping - firstTyping;
    }

    // Calculate pause time
    let pauseStart: number | null = null;
    for (const activityRecord of activities) {
      const activity = activityRecord.activity;
      
      if (activity.type === 'pause') {
        pauseStart = activity.timestamp;
      } else if (activity.type === 'resume' && pauseStart !== null) {
        totalPauseTime += activity.timestamp - pauseStart;
        pauseStart = null;
      }
    }

    // Calculate words per minute (assuming 5 characters per word)
    const words = keystrokes / 5;
    const totalTimeMinutes = (totalTypingTime + totalPauseTime) / (1000 * 60);
    wordsPerMinute = totalTimeMinutes > 0 ? words / totalTimeMinutes : 0;

    return {
      totalTypingTime,
      totalPauseTime,
      keystrokes,
      wordsPerMinute: Math.round(wordsPerMinute * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Validate session ID input
   */
  private validateSessionId(sessionId: string): void {
    if (!sessionId || sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }
  }

  /**
   * Validate activity input
   */
  private validateActivity(activity: Activity): void {
    if (!activity) {
      throw new Error('Activity is required');
    }

    if (!['typing', 'pause', 'resume'].includes(activity.type)) {
      throw new Error(`Invalid activity type: ${activity.type}`);
    }

    if (typeof activity.timestamp !== 'number' || activity.timestamp <= 0) {
      throw new Error('Timestamp must be a positive number');
    }
  }
}
