import React, { useState } from 'react';
import { ViewMode, Ticket, ActivityEvent, EmailToast } from './types';
import { KB_ARTICLES, INITIAL_TICKETS, INITIAL_ACTIVITY_LOGS } from './data/mockData';
import { Header } from './components/Header';
import { EmailToastContainer } from './components/EmailToastContainer';
import { CustomerPortal } from './components/portal/CustomerPortal';
import { LiveChatInterface } from './components/chat/LiveChatInterface';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginGate } from './components/auth/LoginGate';
import { useMsal } from '@azure/msal-react';

function AppShell() {
  const [currentView, setCurrentView] = useState<ViewMode>('portal');
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [kbArticles] = useState(KB_ARTICLES);
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_LOGS);
  const [emailToasts, setEmailToasts] = useState<EmailToast[]>([]);
  const [initialChatQuery, setInitialChatQuery] = useState('');

  // Count pending approvals
  const pendingApprovalsCount = tickets.filter(t => t.status === 'Pending Approval').length;
  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  // Helper to trigger automated email toast
  const triggerEmailToast = (recipient: string, subject: string, ticketId: string, status: string) => {
    const newToast: EmailToast = {
      id: `toast-${Date.now()}`,
      recipient,
      subject,
      ticketId,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setEmailToasts((prev) => [newToast, ...prev].slice(0, 4));

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setEmailToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  };

  // Create or Update Ticket from any view
  const handleCreateOrUpdateTicket = (ticket: Ticket) => {
    setTickets((prev) => {
      const exists = prev.some((t) => t.id === ticket.id);
      if (exists) {
        return prev.map((t) => (t.id === ticket.id ? ticket : t));
      }
      return [ticket, ...prev];
    });

    // Add activity log
    const logEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      type: ticket.status === 'Resolved' ? 'auto_resolved' : ticket.status === 'Pending Approval' ? 'approval_required' : 'new_ticket',
      message: `Ticket #${ticket.id} (${ticket.subject.slice(0, 35)}...) updated to ${ticket.status}.`,
      ticketId: ticket.id,
      channel: ticket.channel,
    };
    setActivityLogs((prev) => [logEvent, ...prev]);

    // Trigger Email Notification Toast
    triggerEmailToast(
      ticket.customer.email,
      `Support Update: Ticket #${ticket.id} [${ticket.status}]`,
      ticket.id,
      ticket.status
    );
  };

  // Single ticket creation from forms (e.g., portal modals)
  const handleCreateTicketFromForm = (ticketData: {
    subject: string;
    category: string;
    priority: any;
    description: string;
    channel: 'chat' | 'email' | 'call' | 'slack' | 'portal';
    attachmentName?: string;
  }) => {
    // Manually-filed portal tickets are treated as Service Requests (a
    // structured ask the user filled in themselves), matching the SRV/INC
    // split the AI-triaged chat path assigns automatically.
    const newId = `SRV${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: Ticket = {
      id: newId,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category,
      channel: ticketData.channel,
      priority: ticketData.priority,
      status: 'In Progress',
      customer: {
        id: 'CUST-8801',
        name: 'Alex Mercer',
        email: 'alex.mercer@acmecorp.com',
        company: 'Acme Corp',
        tier: 'Enterprise',
        priorTicketsCount: 3,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      assignedAgent: 'AI Support Agent',
      createdTime: 'Just now',
      lastUpdated: 'Just now',
      confidenceScore: 92,
      attachmentUrl: ticketData.attachmentName,
      conversationHistory: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: 'Alex Mercer',
          text: ticketData.description,
          timestamp: 'Just now',
        },
      ],
    };

    handleCreateOrUpdateTicket(newTicket);
  };

  // Open Chat from Portal with prefilled query
  const handleOpenChatWithQuery = (query?: string) => {
    if (query) setInitialChatQuery(query);
    setCurrentView('chat');
  };

  // Manual test trigger for email alert
  const handleTestEmailAlert = () => {
    triggerEmailToast('alex.mercer@acmecorp.com', 'Test Email Notification: Ticket #TCK-4519 Status Updated', 'TCK-4519', 'Resolved');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        pendingApprovalsCount={pendingApprovalsCount}
        openTicketsCount={openTicketsCount}
        onTriggerDemoEmail={handleTestEmailAlert}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'portal' && (
          <CustomerPortal
            articles={kbArticles}
            onOpenChat={handleOpenChatWithQuery}
            onCreateTicket={handleCreateTicketFromForm}
          />
        )}

        {currentView === 'chat' && (
          <LiveChatInterface
            initialQuery={initialChatQuery}
            onTicketCreatedOrUpdated={handleCreateOrUpdateTicket}
            userTickets={tickets.filter(t => t.customer.name === 'Alex Mercer')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            tickets={tickets}
            onUpdateTicket={handleCreateOrUpdateTicket}
            activityLogs={activityLogs}
            onAddActivityLog={(evt) => setActivityLogs((prev) => [evt, ...prev])}
            onTriggerEmailToast={triggerEmailToast}
          />
        )}
      </main>

      {/* Global Email Toast Notifications */}
      <EmailToastContainer
        toasts={emailToasts}
        onDismiss={(id) => setEmailToasts((prev) => prev.filter((t) => t.id !== id))}
      />

    </div>
  );
}

export default function App() {
  return (
    <LoginGate>
      <AppShell />
    </LoginGate>
  );
}
