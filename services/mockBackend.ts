import { UserProfile, AdminConfig, UserUsageLimits, InteractionEvent, SystemMetric, BeYouSession, UserRole, LeadCapsule } from '../types';

const USERS_KEY = 'curious_users_v14';
const ADMIN_CONFIG_KEY = 'curious_admin_config_v14';
const CURRENT_USER_ID_KEY = 'curious_current_user_id_v14';
const EVENT_LOG_KEY = 'curious_event_log_v14';
const BLOCKED_ENTITIES_KEY = 'curious_blocked_entities_v14'; 
const LEADS_KEY = 'curious_leads_v14';

const DEFAULT_ADMIN_PASS = 'admin2025#';

const DEFAULT_LIMITS: UserUsageLimits = {
  scenarioLimit: 3,
  beYouLimit: 3,
  oceanLimit: 5
};

class MockBackendService {
  private users: UserProfile[] = [];
  private eventLog: InteractionEvent[] = [];
  private leads: LeadCapsule[] = [];
  private blockedEntities: { ips: string[], ids: string[] } = { ips: [], ids: [] };
  private adminConfig: AdminConfig = {
    passwordHash: DEFAULT_ADMIN_PASS,
    liveVisitorBase: 0 
  };
  private systemStartTime = Date.now();
  private currentSessionId: string;

  constructor() {
    this.currentSessionId = this.getOrCreateSessionId();
    this.loadData();
    this.initializeRegistry();
    this.trackEvent(this.currentSessionId, 'PAGE_VIEW', `Uplink established from ${this.getDeviceSignature()}`);
  }

  private getDeviceSignature(): string {
    if (typeof navigator === 'undefined') return 'Unknown Engine';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet Interface';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile Interface (Phone)';
    return 'Desktop Terminal';
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'ssr-session';
    let id = sessionStorage.getItem('cm_session_id');
    if (!id) {
      id = `node-${crypto.randomUUID().substring(0, 8)}`;
      sessionStorage.setItem('cm_session_id', id);
    }
    return id;
  }

  private generateReferralCode(name: string): string {
    const prefix = (name || 'USER').substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${random}`;
  }

  private initializeRegistry() {
    if (!this.users) this.users = [];
    
    let adminNode = this.users.find(u => u.id === this.currentSessionId);
    if (!adminNode) {
      adminNode = {
        id: this.currentSessionId,
        name: 'SUPER ADMIN',
        email: 'root@curiousminds.internal',
        phone: '---',
        device: this.getDeviceSignature(),
        type: 'STUDENT',
        role: 'ADMIN',
        usage: { scenarioCount: 0, beYouCount: 0, oceanCount: 0 },
        limits: { scenarioLimit: 9999, beYouLimit: 9999, oceanLimit: 9999 },
        registeredAt: this.systemStartTime,
        lastActiveAt: Date.now(),
        ip: "127.0.0.1 (Local Interface)",
        location: { city: 'Neural Hub', country: 'Admin Workspace', lat: 28.61, lng: 77.20, flag: '👑' },
        isBlocked: false,
        referralCode: this.generateReferralCode('ADMIN')
      };
      this.users.push(adminNode);
    } else {
        adminNode.device = this.getDeviceSignature();
    }

    if (this.users.length <= 1) {
      const satellites: UserProfile[] = [
        {
          id: 'node-glob-001',
          name: 'Aarav Sharma',
          email: 'aarav.s@edu.in',
          phone: '+91 98765 43210',
          device: 'Mobile Interface (Phone)',
          type: 'STUDENT',
          role: 'JOINED',
          usage: { scenarioCount: 2, beYouCount: 1, oceanCount: 4 },
          limits: { ...DEFAULT_LIMITS },
          registeredAt: Date.now() - 86400000,
          lastActiveAt: Date.now() - 120000,
          ip: '106.51.78.142',
          location: { city: 'Bangalore', country: 'India', lat: 12.97, lng: 77.59, flag: '🇮🇳' },
          isBlocked: false,
          referralCode: 'IND789X'
        },
        {
          id: 'node-glob-002',
          name: 'Sarah Jenkins',
          email: 's.jenkins@stanford.edu',
          phone: '+1 650 555 0123',
          device: 'Desktop Terminal',
          type: 'STUDENT',
          role: 'DEMO',
          usage: { scenarioCount: 1, beYouCount: 0, oceanCount: 2 },
          limits: { ...DEFAULT_LIMITS },
          registeredAt: Date.now() - 432000000,
          lastActiveAt: Date.now() - 5000,
          ip: '73.12.45.201',
          location: { city: 'San Francisco', country: 'USA', lat: 37.77, lng: -122.41, flag: '🇺🇸' },
          isBlocked: false,
          referralCode: 'SFO442Y'
        }
      ];
      this.users.push(...satellites);
    }

    this.saveData();
    localStorage.setItem(CURRENT_USER_ID_KEY, this.currentSessionId);
  }

  public loadData() {
    if (typeof window === 'undefined') return;
    try {
      const storedConfig = localStorage.getItem(ADMIN_CONFIG_KEY);
      if (storedConfig) this.adminConfig = JSON.parse(storedConfig);

      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) this.users = JSON.parse(storedUsers);

      const storedEvents = localStorage.getItem(EVENT_LOG_KEY);
      if (storedEvents) this.eventLog = JSON.parse(storedEvents);

      const storedLeads = localStorage.getItem(LEADS_KEY);
      if (storedLeads) this.leads = JSON.parse(storedLeads);

      const storedBlocked = localStorage.getItem(BLOCKED_ENTITIES_KEY);
      if (storedBlocked) this.blockedEntities = JSON.parse(storedBlocked);
    } catch (e) { console.error("Restore failed", e); }
  }

  private saveData() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(this.adminConfig));
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(this.eventLog));
    localStorage.setItem(LEADS_KEY, JSON.stringify(this.leads));
    localStorage.setItem(BLOCKED_ENTITIES_KEY, JSON.stringify(this.blockedEntities));
  }

  public isAccessRevoked(): boolean {
    const user = this.getCurrentUser();
    const currentIP = user?.ip || "unknown";
    return this.blockedEntities.ids.includes(this.currentSessionId) || 
           this.blockedEntities.ips.includes(currentIP);
  }

  authenticateAdmin(username: string, password: string): boolean {
    return username === 'admin' && password === (this.adminConfig?.passwordHash || DEFAULT_ADMIN_PASS);
  }

  updateAdminPassword(newPass: string) {
    this.adminConfig.passwordHash = newPass;
    this.saveData();
  }

  registerUser(details: any): UserProfile {
    const newUser: UserProfile = {
      ...details,
      id: `node-${crypto.randomUUID().substring(0, 8)}`,
      device: this.getDeviceSignature(),
      role: 'DEMO', 
      usage: { scenarioCount: 0, beYouCount: 0, oceanCount: 0 },
      limits: { ...DEFAULT_LIMITS }, 
      registeredAt: Date.now(),
      lastActiveAt: Date.now(),
      referralCode: this.generateReferralCode(details?.name || 'USER'),
      ip: `192.168.1.${Math.floor(Math.random() * 255)} (Verified Interface)`,
      location: { city: 'New Delhi', country: 'India', lat: 28.61, lng: 77.20, flag: '🇮🇳' },
      isBlocked: false
    };
    this.users.push(newUser);
    this.saveData();
    return newUser;
  }

  captureLead(lead: Omit<LeadCapsule, 'id' | 'timestamp'>) {
    const newLead: LeadCapsule = {
      ...lead,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    this.leads.push(newLead);
    this.saveData();
  }

  getLeads(): LeadCapsule[] {
    return [...this.leads].sort((a, b) => b.timestamp - a.timestamp);
  }

  getCurrentUser(): UserProfile | null {
    const id = localStorage.getItem(CURRENT_USER_ID_KEY);
    return this.users.find(u => u.id === id) || null;
  }

  getAllUsers(): UserProfile[] {
    return [...this.users].sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  }

  updateUserRole(userId: string, role: UserRole) {
    const user = this.users.find(u => u.id === userId);
    if (user) { user.role = role; this.saveData(); }
  }

  updateUserLimits(userId: string, limits: UserUsageLimits) {
    const user = this.users.find(u => u.id === userId);
    if (user) { user.limits = { ...limits }; this.saveData(); }
  }

  toggleBlockUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    user.isBlocked = !user.isBlocked;
    
    if (user.isBlocked) {
      if (!this.blockedEntities.ids.includes(user.id)) this.blockedEntities.ids.push(user.id);
      if (!this.blockedEntities.ips.includes(user.ip)) this.blockedEntities.ips.push(user.ip);
    } else {
      this.blockedEntities.ids = this.blockedEntities.ids.filter(id => id !== user.id);
      this.blockedEntities.ips = this.blockedEntities.ips.filter(ip => ip !== user.ip);
    }
    
    this.saveData();
    this.trackEvent(userId, 'MODAL_OPEN', `Security Protocol: Node ${user.isBlocked ? 'BLACK-LISTED' : 'RESTORED'}`);
  }

  saveBeYouSession(userId: string, session: BeYouSession) {
    const user = this.users.find(u => u.id === userId);
    if (user) { user.beYouSession = session; this.saveData(); }
  }

  checkUsageLimit(userId: string, mode: 'SCENARIO' | 'BEYOU' | 'OCEAN'): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user || user.isBlocked) return false;
    const limits = user.limits || DEFAULT_LIMITS;
    if (mode === 'SCENARIO') return user.usage.scenarioCount < limits.scenarioLimit;
    if (mode === 'BEYOU') return user.usage.beYouCount < limits.beYouLimit;
    if (mode === 'OCEAN') return user.usage.oceanCount < limits.oceanLimit;
    return false;
  }

  incrementUsage(userId: string, mode: 'SCENARIO' | 'BEYOU' | 'OCEAN') {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      if (mode === 'SCENARIO') user.usage.scenarioCount++;
      if (mode === 'BEYOU') user.usage.beYouCount++;
      if (mode === 'OCEAN') user.usage.oceanCount++;
      user.lastActiveAt = Date.now();
      this.saveData();
    }
  }

  trackEvent(userId: string | null, type: InteractionEvent['type'], details?: string, timestamp: number = Date.now()) {
    const targetId = userId || this.currentSessionId;
    const event: InteractionEvent = { id: crypto.randomUUID(), userId: targetId, type, timestamp, details: details || 'Signal Captured' };
    this.eventLog.push(event);
    if (this.eventLog.length > 5000) this.eventLog.shift();
    this.saveData();
  }

  getSystemMetrics(): SystemMetric {
    return { cpu: 4, memory: 8, latency: 12, activeConnections: this.users.length, errorRate: 0, requestsPerSecond: 1, region: "Global", uptime: 1000 };
  }

  getTrafficLogs(minutes: number = 30): InteractionEvent[] {
    const now = Date.now();
    return this.eventLog.filter(l => l.timestamp >= now - (minutes * 60 * 1000)).sort((a, b) => b.timestamp - a.timestamp);
  }

  getUserNavigationLogs(userId: string): InteractionEvent[] {
    return this.eventLog.filter(l => l.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  }

  getCurrentSessionId(): string { return this.currentSessionId; }
}

export const mockBackend = new MockBackendService();