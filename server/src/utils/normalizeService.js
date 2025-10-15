// services/normalizeService.js
import { LogSources, Action } from "@prisma/client";
import { toAction, to0to10, num, parseTimestamp } from "./helper.js";

function parseSyslogKV(line) {
  const out = { original: line };

  const priMatch = line.match(/^<(\d+)>/);
  if (priMatch) out.pri = Number(priMatch[1]);

  const tsHostMatch = line.replace(/^<\d+>/, "").trim().split(/\s+/);
  if (tsHostMatch.length >= 4) {
    const month = tsHostMatch[0];
    const day = tsHostMatch[1];
    const time = tsHostMatch[2];
    const host = tsHostMatch[3];
    out.timestamp_str = `${month} ${day} ${time}`;
    out.host = host;
  }

  const kv = {};
  for (const m of line.matchAll(/(\w+)=([^\s]+)/g)) {
    kv[m[1]] = m[2];
  }
  out.kv = kv;

  return { raw: out, kv };
}

export function normalizeData(tenant, source, payload) {
  const now = new Date();

  const out = {
    tenant,
    source,
    timestamp: now,
    eventType: undefined,
    eventSubtype: undefined,
    severity: undefined,
    action: undefined,
    user: undefined,
    host: undefined,
    process: undefined,
    srcIp: undefined,
    srcPort: undefined,
    dstIp: undefined,
    dstPort: undefined,
    protocol: undefined,
    url: undefined,
    httpMethod: undefined,
    statusCode: undefined,
    cloudAccountId: undefined,
    cloudRegion: undefined,
    cloudService: undefined,
    vendor: undefined,
    product: undefined,
    reason: undefined,
    raw: (typeof payload === "object" ? payload : { value: String(payload) }),
    tags: [String(source).toLowerCase()],
  };

  switch (source) {
    case LogSources.API: {
      out.timestamp = parseTimestamp(payload?.["@timestamp"] || payload?.timestamp);
      out.action = toAction(payload?.action);
      out.severity = to0to10(payload?.severity);
      out.eventType = payload?.event_type || payload?.eventType || "application";
      out.user = payload?.user;
      out.srcIp = payload?.ip || payload?.src_ip;
      out.reason = payload?.reason;
      break;
    }

    case LogSources.FIREWALL:{
      if (typeof payload === "string") {
        // Parse syslog line -> object
        const { raw, kv } = parseSyslogKV(payload);
        out.raw = raw;
        out.eventType = "system";
        out.eventSubtype = "syslog";
        out.vendor = kv.vendor;
        out.product = kv.product;

        // Map common kvs
        out.srcIp = kv.ip || kv.src || kv.src_ip;
        out.dstIp = kv.dst || kv.dst_ip;
        out.srcPort = num(kv.spt || kv.src_port);
        out.dstPort = num(kv.dpt || kv.dst_port);
        out.protocol = kv.proto || kv.protocol;
        out.action = toAction(kv.action) || Action.ALERT;
        out.reason = kv.msg || kv.reason || "syslog";
        out.severity = num(kv.severity) || 9;
        out.eventType = kv.policy || kv.event || "syslog";
      } else {
        // Structured firewall JSON
        out.eventType = payload?.event_type || payload?.eventType || "syslog";
        out.timestamp = parseTimestamp(payload?.["@timestamp"] || payload?.timestamp);
        out.srcIp = payload?.ip || payload?.src_ip;
        out.srcPort = num(payload?.src_port);
        out.dstIp = payload?.dst_ip;
        out.dstPort = num(payload?.dst_port);
        out.protocol = payload?.protocol;
        out.action = toAction(payload?.action);
        out.severity = to0to10(payload?.severity);
        out.eventType = payload?.policy;
        out.reason = payload?.msg;
        out.reason = payload?.reason;
      }
      break;
    }
    case LogSources.NETWORK: {
      if (typeof payload === "string") {
        // Parse syslog line -> object
        const { raw, kv } = parseSyslogKV(payload);
        out.raw = raw;
        out.eventType = "system";
        out.eventSubtype = "syslog";
        out.vendor = kv.vendor;
        out.product = kv.product;

        // Map common kvs
        out.srcIp = kv.ip || kv.src || kv.src_ip;
        out.dstIp = kv.dst || kv.dst_ip;
        out.srcPort = num(kv.spt || kv.src_port);
        out.dstPort = num(kv.dpt || kv.dst_port);
        out.protocol = kv.proto || kv.protocol;
        out.action = toAction(kv.action) || Action.ALERT;
        out.reason = kv.reason || "syslog";
        out.eventType = kv.event || "syslog";
      } else {
        // Structured firewall JSON
        out.eventType = payload?.event_type || payload?.eventType || "syslog";
        out.timestamp = parseTimestamp(payload?.["@timestamp"] || payload?.timestamp);
        out.srcIp = payload?.ip || payload?.src_ip;
        out.srcPort = num(payload?.src_port);
        out.dstIp = payload?.dst_ip;
        out.dstPort = num(payload?.dst_port);
        out.protocol = payload?.protocol;
        out.action = toAction(payload?.action);
        out.severity = to0to10(payload?.severity);

        out.reason = payload?.reason;
      }
      break;
    }

    case LogSources.AWS: {
      out.timestamp = parseTimestamp(payload?.["@timestamp"] || payload?.eventTime);
      out.action = toAction(payload?.action);
      out.severity = to0to10(payload?.severity);
      out.eventType = payload?.event_type || payload?.eventType || "audit";
      out.user = payload?.user;
      out.srcIp = payload?.ip || payload?.src_ip;
      out.statusCode = payload?.status;

      if (payload?.cloud) {
        out.cloudService = payload.cloud.service;
        out.cloudAccountId = payload.cloud.account_id;
        out.cloudRegion = payload.cloud.region;
      }
      break;
    }

    case LogSources.M365: {
      out.timestamp = parseTimestamp(payload?.["@timestamp"] || payload?.CreationTime);
      out.action = toAction(payload?.action);
      out.severity = to0to10(payload?.severity);
      out.eventType = payload?.event_type || payload?.eventType || "audit";
      out.user = payload?.user;
      out.srcIp = payload?.ip || payload?.src_ip;
      out.statusCode = payload?.status;
      out.process = payload?.workload;
      break;
    }

    case LogSources.AD: {
      out.timestamp = parseTimestamp(payload?.["@timestamp"] || payload?.TimeCreated);
      out.action = String(payload?.event_id || payload?.EventID) === "4624" 
        ? Action.LOGIN 
        : Action.ALERT;
      out.severity = to0to10(payload?.severity);
      out.eventType = payload?.event_type || payload?.eventType || "authentication";
      out.user = payload?.user;
      out.host = payload?.host;
      out.srcIp = payload?.ip || payload?.src_ip;
      break;
    }

    case LogSources.CROWDSTRIKE: {
      out.timestamp = parseTimestamp(payload?.["@timestamp"] || payload?.timestamp);
      out.eventType = payload?.event_type || payload?.eventType || "alert";
      out.host = payload?.host;
      out.process = payload?.process;
      out.action = toAction(payload?.action || payload?.event_action) || Action.ALERT;
      out.severity = to0to10(payload?.severity);
      out.srcIp = payload?.ip || payload?.src_ip;
      break;
    }
  }

  return out;
}