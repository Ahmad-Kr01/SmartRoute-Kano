export interface SmsLog {
  id: string;
  waybillId: string;
  recipient: string;
  destinationPhone: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'simulated';
  gatewayResponse: string;
  timestamp: string;
  provider: 'africas_talking';
}

export interface SmsSatusInfo {
  success: boolean;
  log?: SmsLog;
  isSimulated?: boolean;
}

export interface SmsBackendConfig {
  isLiveActive: boolean;
  username: string;
  senderId: string;
}

export interface SmsLogsPayload {
  success: boolean;
  logs: SmsLog[];
  config: SmsBackendConfig;
}

/**
 * Triggers Africa's Talking SMS delivery via backend proxy endpoint.
 */
export async function sendOutboundSms(params: {
  waybillId: string;
  recipient: string;
  phone: string;
  message: string;
  status?: string;
}): Promise<SmsSatusInfo> {
  try {
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP error ${res.status}`);
    }
    
    return await res.json() as SmsSatusInfo;
  } catch (error: any) {
    console.error('Failed sending outbound SMS notifications:', error);
    throw error;
  }
}

/**
 * Fetches SMS logs audit trail and live configuration state of Africa's Talking gateway.
 */
export async function fetchSmsLogs(): Promise<SmsLogsPayload> {
  try {
    const res = await fetch('/api/sms/logs');
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json() as SmsLogsPayload;
  } catch (error) {
    console.error('Error loading SMS logs trail:', error);
    return {
      success: false,
      logs: [],
      config: { isLiveActive: false, username: 'sandbox (fallback)', senderId: 'None' }
    };
  }
}

/**
 * Reset logs
 */
export async function clearSmsLogs(): Promise<boolean> {
  try {
    const res = await fetch('/api/sms/clear-logs', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
