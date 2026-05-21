import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load variables from .env
dotenv.config();

interface SmsLogEntry {
  id: string;             // Unique identifier for the log
  waybillId: string;     // Reference to shipment id
  recipient: string;     // Recipient name
  destinationPhone: string; // Recipient phone number
  message: string;       // Text content
  status: 'sent' | 'delivered' | 'failed' | 'simulated';
  gatewayResponse: string; // HTTP payload or summary
  timestamp: string;     // Date ISO string
  provider: 'africas_talking';
}

// In-memory logs list for operational auditing
const smsLogs: SmsLogEntry[] = [
  {
    id: 'LOG-001',
    waybillId: 'SRK-TRACK-592',
    recipient: 'Alhaji Yusuf',
    destinationPhone: '+2348037629481',
    message: "SmartRoute Kano: Waybill SRK-TRACK-592 is In Transit with Musa Bello. Passcode token: 4821.",
    status: 'simulated',
    gatewayResponse: 'Simulated success inside Africa\'s Talking Sandbox environment.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    provider: 'africas_talking'
  },
  {
    id: 'LOG-002',
    waybillId: 'SRK-TRACK-104',
    recipient: 'Binta Suleiman Flour Mills',
    destinationPhone: '+2348125593012',
    message: "SmartRoute Kano: Waybill SRK-TRACK-104 changed to Out for Delivery. Track: https://smartroute.kano",
    status: 'simulated',
    gatewayResponse: 'Simulated successful delivery via SMS Node validation gateway.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    provider: 'africas_talking'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Send SMS via Africa's Talking API
  app.post('/api/sms/send', async (req, res) => {
    try {
      const { waybillId, recipient, phone, message, originHub, status, overrideConfig } = req.body;

      if (!phone || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Recipient phone number and message body are required parameters.' 
        });
      }

      // Format recipient phone number: AT requires international format (e.g., +234...)
      let formattedPhone = phone.trim().replace(/\s+/g, '');
      if (formattedPhone.startsWith('0') && formattedPhone.length === 11) {
        // Assume Nigerian local format to international format (+234)
        formattedPhone = '+234' + formattedPhone.substring(1);
      }

      // Read environment keys OR interactive runtime client override
      const atUsername = overrideConfig?.username || process.env.AT_USERNAME || '';
      const atApiKey = overrideConfig?.apiKey || process.env.AT_API_KEY || '';
      const atSenderId = overrideConfig?.senderId || process.env.AT_SENDER_ID || '';

      const isLiveConfigured = atUsername.trim() !== '' && atApiKey.trim() !== '';

      const logId = `LOG-${Math.floor(100000 + Math.random() * 900000)}`;
      const logEntry: SmsLogEntry = {
        id: logId,
        waybillId: waybillId || 'SRK-GENERIC',
        recipient: recipient || 'Recipient',
        destinationPhone: formattedPhone,
        message,
        status: 'simulated',
        gatewayResponse: '',
        timestamp: new Date().toISOString(),
        provider: 'africas_talking'
      };

      if (isLiveConfigured) {
        console.log(`Outbound Live SMS delivery attempt via Africa's Talking: ${formattedPhone}`);
        
        // Build url-encoded payload
        const urlParams = new URLSearchParams();
        urlParams.append('username', atUsername);
        urlParams.append('to', formattedPhone);
        urlParams.append('message', message);
        if (atSenderId) {
          urlParams.append('from', atSenderId);
        }

        const isSandbox = atUsername.toLowerCase() === 'sandbox';
        const atUrl = isSandbox 
          ? 'https://api.sandbox.africastalking.com/version1/messaging'
          : 'https://api.africastalking.com/version1/messaging';

        try {
          const response = await fetch(atUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'apiKey': atApiKey
            },
            body: urlParams.toString()
          });

          const data = await response.json() as any;

          if (response.ok && data?.SMSMessageData?.Recipients) {
            const list = data.SMSMessageData.Recipients;
            const primaryRecipient = list[0];
            const recipientStatus = primaryRecipient?.status; 
            
            logEntry.status = (recipientStatus === 'Success') ? 'sent' : 'failed';
            logEntry.gatewayResponse = JSON.stringify(data);
            console.log(`Africa's Talking gateway finished: ${recipientStatus}`);
          } else {
            logEntry.status = 'failed';
            logEntry.gatewayResponse = `HTTP ${response.status}: ${JSON.stringify(data)}`;
            console.error('Failed response from Africa\'s Talking SDK endpoint:', data);
          }
        } catch (fetchErr: any) {
          logEntry.status = 'failed';
          logEntry.gatewayResponse = `Fetch Error raised: ${fetchErr.message}`;
          console.error('Outbound carrier request failed:', fetchErr);
        }
      } else {
        // Fallback simulated sandbox triggers
        logEntry.status = 'simulated';
        logEntry.gatewayResponse = `Simulated successful SMS delivery. (Set AT_USERNAME and AT_API_KEY environment variables to enable professional SMS notifications).`;
        console.log(`[SMS Sandbox Simulation] Sent to ${formattedPhone}: "${message}"`);
      }

      // Add to head of logs
      smsLogs.unshift(logEntry);

      return res.status(200).json({
        success: logEntry.status !== 'failed',
        log: logEntry,
        isSimulated: !isLiveConfigured
      });

    } catch (globalErr: any) {
      console.error('Fatal crash on SMS API router handler:', globalErr);
      return res.status(500).json({ 
        success: false, 
        error: `Core service failure: ${globalErr.message}` 
      });
    }
  });

  // API Route: Fetch outbound sms logger dashboard
  app.get('/api/sms/logs', (req, res) => {
    res.json({
      success: true,
      logs: smsLogs,
      config: {
        isLiveActive: !!(process.env.AT_API_KEY && process.env.AT_USERNAME),
        username: process.env.AT_USERNAME || 'sandbox (fallback)',
        senderId: process.env.AT_SENDER_ID || 'None'
      }
    });
  });

  // API Route: Reset logs
  app.post('/api/sms/clear-logs', (req, res) => {
    smsLogs.length = 0;
    res.json({ success: true });
  });

  // Express + Vite Integration Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartRoute Kano Fullstack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
