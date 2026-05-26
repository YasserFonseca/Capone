export type TenantStatus    = 'pending' | 'active' | 'suspended'
export type WhatsappStatus  = 'disconnected' | 'connecting' | 'connected'
export type PaymentType     = 'setup' | 'monthly'
export type PaymentStatus   = 'pending' | 'approved' | 'rejected' | 'refunded'

export interface Tenant {
  id:                 string
  segment_id:         string
  company_name:       string
  owner_email:        string
  status:             TenantStatus
  mp_preference_id:   string | null
  mp_subscription_id: string | null
  next_billing_at:    string | null
  created_at:         string
  plan?:              string
  segments?:          { name: string; slug: string }
  whatsapp_instances?: { status: WhatsappStatus; connected_at: string | null }
  platform_payments?: { amount: number; type: PaymentType }[]
}

export interface Segment {
  id:         string
  slug:       string
  name:       string
  active:     boolean
  created_at: string
}

export interface PlatformPayment {
  id:            string
  tenant_id:     string
  mp_payment_id: string
  type:          PaymentType
  amount:        number
  status:        PaymentStatus
  paid_at:       string | null
  created_at:    string
  tenants?:      { company_name: string }
}

export interface WhatsappInstance {
  id:            string
  tenant_id:     string
  instance_name: string
  status:        WhatsappStatus
  connected_at:  string | null
  created_at:    string
  tenants?:      { company_name: string; owner_email: string }
}

export interface Appointment {
  id:             string
  tenant_id:      string
  customer_name:  string | null
  customer_phone: string | null
  service:        string | null
  scheduled_at:   string
  status:         string
  created_at:     string
  tenants?:       { company_name: string }
}

export interface Conversation {
  id:              string
  tenant_id:       string
  customer_phone:  string
  last_message_at: string | null
  created_at:      string
  tenants?:        { company_name: string }
  message_count?:  number
}

export interface DashboardMetrics {
  totalActive:     number
  totalPending:    number
  totalSuspended:  number
  mrr:             number
  whatsappOnline:  number
  whatsappOffline: number
  messagesToday:   number
  newThisMonth:    number
}

export interface RevenuePoint {
  month:  string
  amount: number
}

export interface RevenueSummary {
  totalApproved: number
  totalSetup:    number
  totalMonthly:  number
  totalPending:  number
  countApproved: number
}
