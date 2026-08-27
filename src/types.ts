export type ViewMode = 'portal' | 'chat' | 'admin';

export type TicketChannel = 'chat' | 'email' | 'call' | 'slack' | 'portal';

export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 'Open' | 'In Progress' | 'Pending Approval' | 'Resolved' | 'Escalated';

export type CustomerTier = 'Enterprise' | 'Pro' | 'Starter' | 'Free';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  tier: CustomerTier;
  priorTicketsCount: number;
  avatar?: string;
  phone?: string;
}

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
  tags: string[];
  readTime: string;
  helpfulCount: number;
  policyCode?: string;
}

export interface MultiAgentStep {
  agentName: 'Intake Agent' | 'Triage Agent' | 'RAG Agent' | 'Resolver Agent' | 'Critic Agent' | 'Manager Agent' | 'Action Agent';
  status: 'pending' | 'in_progress' | 'completed' | 'warning';
  message: string;
  timestamp: string;
  details?: string;
}

// The actual loop-engineering mechanics behind a ticket run: how many
// agent-to-agent turns it took against the hard cap, which guardrails fired,
// and which explicit exit condition the loop terminated on.
export interface LoopMetadata {
  turn_count: number;
  max_turns: number;
  max_turns_reached: boolean;
  guardrail_flags: string[];
  exit_condition: string;
  exit_condition_label: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  agentSteps?: MultiAgentStep[];
  kbCitations?: { id: string; title: string; linkText: string }[];
  actionExecuted?: string;
  confidenceScore?: number; // 0-100
  needsApproval?: boolean;
  loopMetadata?: LoopMetadata;
  ticketNumber?: string;
  requestType?: 'incident' | 'service_request';
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  channel: TicketChannel;
  priority: TicketPriority;
  status: TicketStatus;
  customer: Customer;
  assignedAgent: string; // 'AI Support Agent' or human name
  createdTime: string;
  lastUpdated: string;
  // Real ISO timestamps, present when this ticket came from the live backend
  // (GET /tickets, backed by Cosmos DB's created_at/updated_at). Mock/demo
  // tickets won't have these - date filtering treats that as "unknown date."
  createdAtIso?: string;
  updatedAtIso?: string;
  // The real Cosmos DB document id (TicketState.ticketId), needed to call
  // POST /tickets/{id}/decision. Distinct from `id` above, which is the
  // human-facing SRV/INC number used for display.
  backendTicketId?: string;
  confidenceScore?: number; // 0 - 100
  aiDraftResponse?: string;
  agentTrace?: MultiAgentStep[];
  kbUsed?: string[];
  backendActionTaken?: string;
  conversationHistory: ChatMessage[];
  attachmentUrl?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'new_ticket' | 'auto_resolved' | 'escalated' | 'approval_required' | 'human_replied';
  message: string;
  ticketId?: string;
  channel?: TicketChannel;
}

export interface EmailToast {
  id: string;
  recipient: string;
  subject: string;
  ticketId: string;
  status: string;
  timestamp: string;
}
