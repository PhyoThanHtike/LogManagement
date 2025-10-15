// seedData.js
import { LogSources, Tenant, Action } from '@prisma/client';

// ---------------------- LOGS ----------------------
export const seedLogs = [
  {
    id: 'log_1',
    timestamp: new Date('2025-09-02T09:15:00Z'),
    tenant: Tenant.TENANT1,
    source: LogSources.FIREWALL,
    eventType: 'Firewall Block',
    severity: 8,
    srcIp: '192.168.10.24',
    user: 'john.doe@company.com',
    action: Action.BLOCK,
    createdAt: new Date('2025-09-02T09:15:00Z')
  },
  {
    id: 'log_2',
    timestamp: new Date('2025-09-04T13:40:00Z'),
    tenant: Tenant.TENANT2,
    source: LogSources.M365,
    eventType: 'Suspicious Login',
    severity: 6,
    srcIp: '203.0.113.25',
    user: 'jane.smith@company.com',
    action: Action.ALERT,
    createdAt: new Date('2025-09-04T13:40:00Z')
  },
  {
    id: 'log_3',
    timestamp: new Date('2025-09-05T11:00:00Z'),
    tenant: Tenant.TENANT3,
    source: LogSources.CROWDSTRIKE,
    eventType: 'Malware Detected',
    severity: 9,
    srcIp: '10.0.2.45',
    user: 'alice.jones@company.com',
    action: Action.QUARANTINE,
    createdAt: new Date('2025-09-05T11:00:00Z')
  },
  {
    id: 'log_4',
    timestamp: new Date('2025-09-08T17:20:00Z'),
    tenant: Tenant.TENANT4,
    source: LogSources.AD,
    eventType: 'Multiple Failed Logins',
    severity: 7,
    srcIp: '192.168.1.87',
    user: 'bob.wilson@company.com',
    action: Action.DENY,
    createdAt: new Date('2025-09-08T17:20:00Z')
  },
  {
    id: 'log_5',
    timestamp: new Date('2025-09-10T08:30:00Z'),
    tenant: Tenant.TENANT1,
    source: LogSources.API,
    eventType: 'Unauthorized API Call',
    severity: 8,
    srcIp: '10.1.2.77',
    user: 'api.service@company.com',
    action: Action.DENY,
    createdAt: new Date('2025-09-10T08:30:00Z')
  },
  {
    id: 'log_6',
    timestamp: new Date('2025-09-12T14:15:00Z'),
    tenant: Tenant.TENANT2,
    source: LogSources.NETWORK,
    eventType: 'Port Scan Detected',
    severity: 7,
    srcIp: '198.51.100.10',
    user: null,
    action: Action.ALERT,
    createdAt: new Date('2025-09-12T14:15:00Z')
  },
  {
    id: 'log_7',
    timestamp: new Date('2025-09-15T16:50:00Z'),
    tenant: Tenant.TENANT3,
    source: LogSources.FIREWALL,
    eventType: 'DDoS Attempt Blocked',
    severity: 9,
    srcIp: '203.0.113.45',
    user: null,
    action: Action.BLOCK,
    createdAt: new Date('2025-09-15T16:50:00Z')
  },
  {
    id: 'log_8',
    timestamp: new Date('2025-09-18T10:45:00Z'),
    tenant: Tenant.TENANT4,
    source: LogSources.AD,
    eventType: 'Privilege Escalation Attempt',
    severity: 10,
    srcIp: '192.168.2.10',
    user: 'charlie.brown@company.com',
    action: Action.BLOCK,
    createdAt: new Date('2025-09-18T10:45:00Z')
  },
  {
    id: 'log_9',
    timestamp: new Date('2025-09-20T09:20:00Z'),
    tenant: Tenant.TENANT1,
    source: LogSources.M365,
    eventType: 'Impossible Travel Detected',
    severity: 7,
    srcIp: '203.0.113.85',
    user: 'john.doe@company.com',
    action: Action.ALERT,
    createdAt: new Date('2025-09-20T09:20:00Z')
  },
  {
    id: 'log_10',
    timestamp: new Date('2025-09-25T12:00:00Z'),
    tenant: Tenant.TENANT2,
    source: LogSources.AWS,
    eventType: 'Root Login Detected',
    severity: 8,
    srcIp: '10.0.3.15',
    user: 'admin@company.com',
    action: Action.ALERT,
    createdAt: new Date('2025-09-25T12:00:00Z')
  },
  {
    id: 'log_11',
    timestamp: new Date('2025-09-28T07:40:00Z'),
    tenant: Tenant.TENANT3,
    source: LogSources.CROWDSTRIKE,
    eventType: 'Ransomware Activity',
    severity: 10,
    srcIp: '10.0.2.200',
    user: 'it.support@company.com',
    action: Action.QUARANTINE,
    createdAt: new Date('2025-09-28T07:40:00Z')
  },
  {
    id: 'log_12',
    timestamp: new Date('2025-10-01T15:15:00Z'),
    tenant: Tenant.TENANT4,
    source: LogSources.NETWORK,
    eventType: 'Unusual Outbound Traffic',
    severity: 7,
    srcIp: '198.51.100.55',
    user: null,
    action: Action.ALERT,
    createdAt: new Date('2025-10-01T15:15:00Z')
  },
  {
    id: 'log_13',
    timestamp: new Date('2025-10-05T08:00:00Z'),
    tenant: Tenant.TENANT1,
    source: LogSources.API,
    eventType: 'Brute Force API Attempts',
    severity: 9,
    srcIp: '10.1.3.33',
    user: 'api.bot@unknown.com',
    action: Action.BLOCK,
    createdAt: new Date('2025-10-05T08:00:00Z')
  },
  {
    id: 'log_14',
    timestamp: new Date('2025-10-10T14:40:00Z'),
    tenant: Tenant.TENANT2,
    source: LogSources.FIREWALL,
    eventType: 'VPN Connection Established',
    severity: 5,
    srcIp: '203.0.113.90',
    user: 'susan.king@company.com',
    action: Action.ALLOW,
    createdAt: new Date('2025-10-10T14:40:00Z')
  },
  {
    id: 'log_15',
    timestamp: new Date('2025-10-14T11:35:00Z'),
    tenant: Tenant.TENANT3,
    source: LogSources.AD,
    eventType: 'Disabled Account Login Attempt',
    severity: 6,
    srcIp: '192.168.3.20',
    user: 'disabled.user@company.com',
    action: Action.DENY,
    createdAt: new Date('2025-10-14T11:35:00Z')
  }
];

// ---------------------- ALERT RULES ----------------------
export const seedAlertRules = [
  {
    id: 'rule_1',
    tenant: Tenant.TENANT1,
    ruleName: 'High Severity Firewall Events',
    logSource: LogSources.FIREWALL,
    severity: 8,
    isActive: true,
    description: 'Alert when firewall blocks with severity >= 8'
  },
  {
    id: 'rule_2',
    tenant: Tenant.TENANT2,
    ruleName: 'Suspicious Authentication',
    logSource: LogSources.AD,
    severity: 6,
    isActive: true,
    description: 'Alert on multiple failed or unusual login attempts'
  },
  {
    id: 'rule_3',
    tenant: Tenant.TENANT3,
    ruleName: 'Malware & Ransomware',
    logSource: LogSources.CROWDSTRIKE,
    severity: 9,
    isActive: true,
    description: 'Alert when malware or ransomware is detected'
  },
  {
    id: 'rule_4',
    tenant: Tenant.TENANT4,
    ruleName: 'Unusual Network Traffic',
    logSource: LogSources.NETWORK,
    severity: 7,
    isActive: true,
    description: 'Alert when outbound traffic is abnormally high'
  },
  {
    id: 'rule_5',
    tenant: Tenant.TENANT1,
    ruleName: 'API Abuse Detection',
    logSource: LogSources.API,
    severity: 8,
    isActive: true,
    description: 'Alert when repeated unauthorized API calls are detected'
  }
];

// ---------------------- ALERTS ----------------------
export const seedAlerts = [
  {
    id: 'alert_1',
    tenant: Tenant.TENANT1,
    alertRuleId: 'rule_1',
    logId: 'log_1',
    ruleName: 'High Severity Firewall Events',
    severity: 8,
    description: 'Firewall blocked a high severity threat',
    isResolved: false
  },
  {
    id: 'alert_2',
    tenant: Tenant.TENANT2,
    alertRuleId: 'rule_2',
    logId: 'log_4',
    ruleName: 'Suspicious Authentication',
    severity: 7,
    description: 'Multiple failed login attempts detected',
    isResolved: false
  },
  {
    id: 'alert_3',
    tenant: Tenant.TENANT3,
    alertRuleId: 'rule_3',
    logId: 'log_3',
    ruleName: 'Malware & Ransomware',
    severity: 9,
    description: 'Malware detected and quarantined by CrowdStrike',
    isResolved: true,
    resolvedAt: new Date('2025-09-06T08:00:00Z')
  },
  {
    id: 'alert_4',
    tenant: Tenant.TENANT4,
    alertRuleId: 'rule_4',
    logId: 'log_12',
    ruleName: 'Unusual Network Traffic',
    severity: 7,
    description: 'Unusual outbound traffic volume detected',
    isResolved: false
  },
  {
    id: 'alert_5',
    tenant: Tenant.TENANT1,
    alertRuleId: 'rule_5',
    logId: 'log_5',
    ruleName: 'API Abuse Detection',
    severity: 8,
    description: 'Unauthorized API activity detected',
    isResolved: false
  },
  {
    id: 'alert_6',
    tenant: Tenant.TENANT3,
    alertRuleId: 'rule_3',
    logId: 'log_11',
    ruleName: 'Malware & Ransomware',
    severity: 10,
    description: 'Ransomware behavior blocked and contained',
    isResolved: true,
    resolvedAt: new Date('2025-09-29T12:00:00Z')
  },
  {
    id: 'alert_7',
    tenant: Tenant.TENANT2,
    alertRuleId: 'rule_2',
    logId: 'log_10',
    ruleName: 'Suspicious Authentication',
    severity: 8,
    description: 'Root login detected on AWS account',
    isResolved: false
  },
  {
    id: 'alert_8',
    tenant: Tenant.TENANT4,
    alertRuleId: 'rule_4',
    logId: 'log_8',
    ruleName: 'Unusual Network Traffic',
    severity: 10,
    description: 'Privilege escalation attempt detected',
    isResolved: false
  },
  {
    id: 'alert_9',
    tenant: Tenant.TENANT1,
    alertRuleId: 'rule_5',
    logId: 'log_13',
    ruleName: 'API Abuse Detection',
    severity: 9,
    description: 'Brute force API attempts detected',
    isResolved: false
  },
  {
    id: 'alert_10',
    tenant: Tenant.TENANT3,
    alertRuleId: 'rule_3',
    logId: 'log_15',
    ruleName: 'Malware & Ransomware',
    severity: 6,
    description: 'Login attempt from disabled account flagged',
    isResolved: true,
    resolvedAt: new Date('2025-10-14T14:00:00Z')
  },
  {
    id: 'alert_11',
    tenant: Tenant.TENANT1,
    alertRuleId: 'rule_1',
    logId: 'log_9',
    ruleName: 'High Severity Firewall Events',
    severity: 7,
    description: 'Impossible travel detected in M365 logs',
    isResolved: false
  },
  {
    id: 'alert_12',
    tenant: Tenant.TENANT2,
    alertRuleId: 'rule_2',
    logId: 'log_14',
    ruleName: 'Suspicious Authentication',
    severity: 5,
    description: 'VPN connection established outside of business hours',
    isResolved: true,
    resolvedAt: new Date('2025-10-11T09:00:00Z')
  },
  {
    id: 'alert_13',
    tenant: Tenant.TENANT3,
    alertRuleId: 'rule_3',
    logId: 'log_7',
    ruleName: 'Malware & Ransomware',
    severity: 9,
    description: 'DDoS attempt detected and mitigated',
    isResolved: false
  },
  {
    id: 'alert_14',
    tenant: Tenant.TENANT4,
    alertRuleId: 'rule_4',
    logId: 'log_6',
    ruleName: 'Unusual Network Traffic',
    severity: 7,
    description: 'Port scan activity detected across subnets',
    isResolved: false
  },
  {
    id: 'alert_15',
    tenant: Tenant.TENANT1,
    alertRuleId: 'rule_5',
    logId: 'log_5',
    ruleName: 'API Abuse Detection',
    severity: 8,
    description: 'Repeated unauthorized API requests blocked',
    isResolved: true,
    resolvedAt: new Date('2025-09-10T10:30:00Z')
  }
];
