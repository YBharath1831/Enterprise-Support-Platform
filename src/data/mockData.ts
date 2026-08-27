import { KBArticle, Ticket, Customer, ActivityEvent } from '../types';

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-8801',
    name: 'Alex Mercer',
    email: 'alex.mercer@acmecorp.com',
    company: 'Acme Corp',
    tier: 'Enterprise',
    priorTicketsCount: 3,
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'CUST-8802',
    name: 'Sarah Chen',
    email: 'sarah.chen@techglobal.io',
    company: 'TechGlobal Inc',
    tier: 'Enterprise',
    priorTicketsCount: 1,
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'CUST-8803',
    name: 'Marcus Vance',
    email: 'marcus.v@innovatestudio.com',
    company: 'Innovate Studio',
    tier: 'Pro',
    priorTicketsCount: 5,
    phone: '+1 (555) 432-1098',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'CUST-8804',
    name: 'Elena Rostova',
    email: 'elena@cloudops.net',
    company: 'CloudOps Network',
    tier: 'Starter',
    priorTicketsCount: 0,
    phone: '+1 (555) 654-3210',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
];

export const KB_ARTICLES: KBArticle[] = [
  {
    id: 'KB-101',
    title: 'Camera Not Working / Not Detected in Meetings',
    category: 'Hardware & Media',
    summary: 'Troubleshoot webcam permissions, device driver errors, and hardware switch toggles.',
    steps: [
      'Check system privacy settings: Ensure camera access is allowed for browser/app in OS Settings.',
      'Inspect physical privacy shutter or hardware toggle switch on device laptop lid.',
      'Check browser permissions lock icon in address bar and set Camera to "Allow".',
      'Restart the video meeting application or browser tab and clear hardware cache.'
    ],
    tags: ['Camera', 'Webcam', 'Hardware', 'Permissions'],
    readTime: '3 min read',
    helpfulCount: 342,
    policyCode: 'POL-HW-01'
  },
  {
    id: 'KB-102',
    title: 'Browser Crashing or Page Load Failures',
    category: 'Browser & Web App',
    summary: 'Fix browser rendering crashes, out-of-memory errors, and extension conflicts.',
    steps: [
      'Clear browser cache and cookies for the application domain.',
      'Disable third-party browser extensions (especially adblockers & script managers) in Incognito mode.',
      'Verify Hardware Acceleration setting in browser advanced preferences.',
      'Ensure Chrome / Edge / Firefox is updated to the latest build.'
    ],
    tags: ['Browser', 'Crash', 'Cache', 'Extensions'],
    readTime: '4 min read',
    helpfulCount: 512,
    policyCode: 'POL-WEB-04'
  },
  {
    id: 'KB-103',
    title: 'Password Reset & Account Lockout Guide',
    category: 'Account & Security',
    summary: 'Self-service steps to trigger secure password resets or unlock locked accounts.',
    steps: [
      'Click "Forgot Password" on the login portal and enter your official corporate email.',
      'Check email inbox and spam folder for the single-use 15-minute reset token.',
      'If account is locked due to 5 failed attempts, wait 15 minutes or trigger an automated security verification.',
      'Ensure new password meets 12-character complexity requirements.'
    ],
    tags: ['Password', 'Security', 'Lockout', 'Authentication'],
    readTime: '2 min read',
    helpfulCount: 1280,
    policyCode: 'POL-SEC-09'
  },
  {
    id: 'KB-104',
    title: 'Application Not Launching or Crashing on Startup',
    category: 'Software & Desktop',
    summary: 'Resolve desktop app launch freezes, corrupt executable state, and missing dependencies.',
    steps: [
      'Open Task Manager / Activity Monitor and kill any orphaned desktop processes.',
      'Run application as Administrator / Elevated permissions mode.',
      'Locate app data directory (%AppData%/EnterpriseApp) and clear cache folder.',
      'Re-install latest desktop client executable from corporate download portal.'
    ],
    tags: ['Desktop', 'Launch Failure', 'Crash', 'Windows/Mac'],
    readTime: '5 min read',
    helpfulCount: 420,
    policyCode: 'POL-SW-12'
  },
  {
    id: 'KB-105',
    title: 'Slow Internet Speed & Frequent Connection Drops',
    category: 'Network & Connectivity',
    summary: 'Diagnose bandwidth throttling, high latency, and local Wi-Fi / DNS drops.',
    steps: [
      'Perform speed check to verify latency (<50ms) and bandwidth (>10Mbps download).',
      'Flush local DNS cache (run `ipconfig /flushdns` on Windows or `sudo dscacheutil -flushcache` on macOS).',
      'Switch from 2.4GHz Wi-Fi band to 5GHz Wi-Fi or wired Ethernet connection.',
      'Disable bandwidth-heavy torrent or cloud backup sync during enterprise work sessions.'
    ],
    tags: ['Network', 'Wi-Fi', 'DNS', 'Speed'],
    readTime: '3 min read',
    helpfulCount: 689,
    policyCode: 'POL-NET-02'
  },
  {
    id: 'KB-106',
    title: 'Software Installation & Auto-Update Failures',
    category: 'Software & Desktop',
    summary: 'Fix installer exit code errors, permission denied alerts, and corrupt package updates.',
    steps: [
      'Verify workstation has at least 5GB free disk storage space.',
      'Ensure corporate MDM profile or local antivirus is not blocking silent installer executable.',
      'Download standalone full offline installer package instead of delta web installer.',
      'Restart device to clear pending Windows Installer/macOS daemon lock files.'
    ],
    tags: ['Installer', 'Update', 'Permissions', 'MDM'],
    readTime: '4 min read',
    helpfulCount: 310,
    policyCode: 'POL-SW-08'
  },
  {
    id: 'KB-107',
    title: 'Email Sync Issues & Undelivered Message Errors',
    category: 'Email & Workspace',
    summary: 'Troubleshoot Exchange / IMAP sync delays, mailbox quota full alerts, and SPF errors.',
    steps: [
      'Check webmail portal to confirm server-side mailbox connectivity.',
      'Verify Mailbox quota has not exceeded allocated enterprise threshold (e.g. 50GB).',
      'Re-authenticate OAuth credentials or update expired app passwords in email client.',
      'Remove cached .ost or local inbox index files and trigger a clean folder re-sync.'
    ],
    tags: ['Email', 'Outlook', 'Sync', 'Mailbox'],
    readTime: '3 min read',
    helpfulCount: 890,
    policyCode: 'POL-EML-03'
  },
  {
    id: 'KB-108',
    title: 'Billing, Invoicing, & Payment Method Management',
    category: 'Billing & Subscriptions',
    summary: 'How to update corporate credit cards, view tax invoices, and resolve payment failures.',
    steps: [
      'Navigate to Billing & Plans in account settings sidebar.',
      'Select "Payment Methods" and enter valid primary corporate credit card or ACH details.',
      'To download VAT/Tax receipts, click "Invoice History" and export CSV or PDF.',
      'If payment failed due to bank fraud flag, click "Retry Charge" after contacting card issuer.'
    ],
    tags: ['Billing', 'Invoices', 'Payment', 'Credit Card'],
    readTime: '2 min read',
    helpfulCount: 1040,
    policyCode: 'POL-FIN-01'
  },
  {
    id: 'KB-109',
    title: 'Two-Factor Authentication (2FA / MFA) Reset',
    category: 'Account & Security',
    summary: 'Steps to re-register authenticator app, hardware key, or recovery backup codes.',
    steps: [
      'If device lost: Use one of your saved 16-digit Emergency Backup Codes at login prompt.',
      'If no backup codes: Click "Request Security Officer Verification" to trigger SMS step-up token.',
      'Scan new QR code inside Google Authenticator, Duo, or Microsoft Authenticator.',
      'Save new backup codes in secure corporate password vault.'
    ],
    tags: ['2FA', 'MFA', 'Authenticator', 'Security'],
    readTime: '3 min read',
    helpfulCount: 1420,
    policyCode: 'POL-SEC-02'
  },
  {
    id: 'KB-110',
    title: 'File Upload & Download Timeout Failures',
    category: 'Storage & Transfer',
    summary: 'Fix file upload HTTP 413 Payload Too Large, network timeouts, and CORS errors.',
    steps: [
      'Confirm file size is within maximum allowed 500MB single-file payload limit.',
      'Compress directory files into a .zip archive before initiating batch upload.',
      'Check firewall / proxy settings for blocking inspectable binary attachments.',
      'Use multi-part chunked upload option for large files over unstable network lines.'
    ],
    tags: ['File Upload', 'Timeout', 'Attachments', 'Network'],
    readTime: '3 min read',
    helpfulCount: 275,
    policyCode: 'POL-STR-05'
  },
  {
    id: 'KB-111',
    title: 'Audio / Microphone Not Working in Conference Calls',
    category: 'Hardware & Media',
    summary: 'Resolve muted audio input, echo loopback, and unrecognized headset devices.',
    steps: [
      'Check audio device selection in app settings — ensure correct microphone input is selected.',
      'Verify hardware physical mute switch on USB/Bluetooth headset or cable inline pod.',
      'Ensure browser or operating system has microphone permission granted.',
      'Test audio loopback in application settings to verify input decibel meter activity.'
    ],
    tags: ['Audio', 'Microphone', 'Headset', 'Meetings'],
    readTime: '2 min read',
    helpfulCount: 760,
    policyCode: 'POL-HW-03'
  },
  {
    id: 'KB-112',
    title: 'VPN Connection Failure & Tunnel Disconnects',
    category: 'Network & Connectivity',
    summary: 'Troubleshoot SSL VPN gateway connection timeouts, split tunneling, and TAP driver errors.',
    steps: [
      'Verify client certificate has not expired in local credential store.',
      'Restart VPN Virtual Adapter (TUN/TAP) driver in Device Manager / System Settings.',
      'Toggle VPN gateway endpoint node from Primary US-East to Secondary US-West.',
      'Ensure captive portal Wi-Fi login is completed before starting corporate VPN tunnel.'
    ],
    tags: ['VPN', 'Tunnel', 'Security', 'Network'],
    readTime: '4 min read',
    helpfulCount: 950,
    policyCode: 'POL-NET-07'
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TCK-4519',
    subject: 'Password reset link not arriving in corporate email',
    description: 'I tried resetting my password 3 times but no link has arrived in my inbox. Need urgent access for board meeting presentation.',
    category: 'Account & Security',
    channel: 'chat',
    priority: 'High',
    status: 'Resolved',
    customer: SAMPLE_CUSTOMERS[0],
    assignedAgent: 'AI Support Agent',
    createdTime: '10 minutes ago',
    lastUpdated: '2 minutes ago',
    confidenceScore: 96,
    backendActionTaken: 'Automated 15-min secure reset token generated & sent to alex.mercer@acmecorp.com',
    kbUsed: ['KB-103'],
    conversationHistory: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Alex Mercer',
        text: 'Hello, I cannot login to my account and password reset emails are not showing up.',
        timestamp: '10 mins ago',
      },
      {
        id: 'msg-2',
        sender: 'ai',
        senderName: 'AI Support Agent',
        text: 'I understand this is urgent! I checked KB-103 and verified your identity. I have generated a direct password reset link and dispatched it via secondary secure SMTP protocol to your verified address.',
        timestamp: '9 mins ago',
        confidenceScore: 96,
        actionExecuted: 'Triggered Secure Password Reset Token Dispatch',
        kbCitations: [{ id: 'KB-103', title: 'Password Reset & Lockout Guide', linkText: 'View KB-103' }],
      }
    ]
  },
  {
    id: 'TCK-4520',
    subject: 'Camera not detected during live video conference call',
    description: 'Webcam shows black screen in video meeting room. Works fine on Mac FaceTime app.',
    category: 'Hardware & Media',
    channel: 'portal',
    priority: 'Medium',
    status: 'In Progress',
    customer: SAMPLE_CUSTOMERS[1],
    assignedAgent: 'AI Support Agent',
    createdTime: '25 minutes ago',
    lastUpdated: '12 minutes ago',
    confidenceScore: 88,
    kbUsed: ['KB-101'],
    conversationHistory: [
      {
        id: 'msg-10',
        sender: 'user',
        senderName: 'Sarah Chen',
        text: 'My camera is not detected inside the web meeting window.',
        timestamp: '25 mins ago',
      },
      {
        id: 'msg-11',
        sender: 'ai',
        senderName: 'AI Support Agent',
        text: 'This is usually caused by browser media permission settings. Please check the padlock icon next to your URL bar and ensure Camera is set to "Allow".',
        timestamp: '24 mins ago',
        confidenceScore: 88,
        kbCitations: [{ id: 'KB-101', title: 'Camera Not Working Guide', linkText: 'View KB-101' }],
      }
    ]
  },
  {
    id: 'TCK-4521',
    subject: 'Refund request for duplicate monthly invoice charge',
    description: 'Our organization was double charged $499 on August 1st invoice #INV-9921.',
    category: 'Billing & Subscriptions',
    channel: 'email',
    priority: 'Urgent',
    status: 'Pending Approval',
    customer: SAMPLE_CUSTOMERS[2],
    assignedAgent: 'AI Support Agent (Awaiting Human Review)',
    createdTime: '45 minutes ago',
    lastUpdated: '5 minutes ago',
    confidenceScore: 68,
    aiDraftResponse: 'Dear Marcus, I reviewed invoice #INV-9921 and confirmed a duplicate subscription transaction of $499.00. I have drafted a full credit refund to your payment card ending in 4092. Please allow 3-5 business days.',
    kbUsed: ['KB-108'],
    conversationHistory: [
      {
        id: 'msg-20',
        sender: 'user',
        senderName: 'Marcus Vance',
        text: 'Hi support team, we noticed a double payment charge of $499 on our invoice statement this morning.',
        timestamp: '45 mins ago',
      },
      {
        id: 'msg-21',
        sender: 'ai',
        senderName: 'AI Support Agent',
        text: 'I identified duplicate charge transaction #TX-9921. Because this involves an enterprise financial credit > $250, I have drafted the refund approval for Tier 2 Billing Officer review.',
        timestamp: '5 mins ago',
        needsApproval: true,
        confidenceScore: 68,
      }
    ]
  },
  {
    id: 'TCK-4522',
    subject: 'VPN Connection Failure — Gateway Handshake Timeout',
    description: 'Unable to establish secure SSL VPN tunnel from home office setup.',
    category: 'Network & Connectivity',
    channel: 'slack',
    priority: 'High',
    status: 'Escalated',
    customer: SAMPLE_CUSTOMERS[3],
    assignedAgent: 'Human Agent: Dave Rogers',
    createdTime: '1 hour ago',
    lastUpdated: '18 minutes ago',
    confidenceScore: 54,
    kbUsed: ['KB-112'],
    conversationHistory: [
      {
        id: 'msg-30',
        sender: 'user',
        senderName: 'Elena Rostova',
        text: 'Getting SSL Handshake Timeout when connecting to US-East VPN node.',
        timestamp: '1 hour ago',
      },
      {
        id: 'msg-31',
        sender: 'ai',
        senderName: 'AI Support Agent',
        text: 'Standard troubleshooting steps did not resolve certificate validation. Routing ticket to Senior Network Engineer Dave Rogers.',
        timestamp: '40 mins ago',
        confidenceScore: 54,
      }
    ]
  },
  {
    id: 'TCK-4523',
    subject: '2FA device lost — need backup emergency security code',
    description: 'Upgraded phone over the weekend and lost authenticator app sync. Cannot login to dashboard.',
    category: 'Account & Security',
    channel: 'call',
    priority: 'Urgent',
    status: 'Resolved',
    customer: SAMPLE_CUSTOMERS[0],
    assignedAgent: 'AI Support Agent',
    createdTime: '2 hours ago',
    lastUpdated: '1 hour ago',
    confidenceScore: 94,
    backendActionTaken: 'Step-up SMS identity verified & 2FA device reset link issued',
    kbUsed: ['KB-109'],
    conversationHistory: []
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityEvent[] = [
  {
    id: 'act-1',
    timestamp: 'Just now',
    type: 'auto_resolved',
    message: 'AI Agent auto-resolved Ticket #TCK-4519 (Password Reset) with 96% confidence.',
    ticketId: 'TCK-4519',
    channel: 'chat'
  },
  {
    id: 'act-2',
    timestamp: '5 mins ago',
    type: 'approval_required',
    message: 'Ticket #TCK-4521 flagged for Human Approval — Refund draft $499.00.',
    ticketId: 'TCK-4521',
    channel: 'email'
  },
  {
    id: 'act-3',
    timestamp: '18 mins ago',
    type: 'escalated',
    message: 'Ticket #TCK-4522 escalated to Senior Network Engineer Dave Rogers (VPN Failure).',
    ticketId: 'TCK-4522',
    channel: 'slack'
  },
  {
    id: 'act-4',
    timestamp: '25 mins ago',
    type: 'new_ticket',
    message: 'New support request created via Customer Portal by Sarah Chen.',
    ticketId: 'TCK-4520',
    channel: 'portal'
  },
  {
    id: 'act-5',
    timestamp: '1 hour ago',
    type: 'auto_resolved',
    message: 'AI Agent verified identity & reset 2FA for Alex Mercer (Ticket #TCK-4523).',
    ticketId: 'TCK-4523',
    channel: 'call'
  }
];
