import prisma from "../utils/database.js";
import { LogService } from "./logService.js";

export class TopService {
  static async getTopIPsAndTopSources(filters = {}) {
    try {
      const where = LogService.buildWhereClause(filters);

      console.log(
        "Top IPs, Sources, and Actions WHERE clause:",
        JSON.stringify(where, null, 2)
      );

      // Get top IPs, top sources, and top actions in parallel
      const [topIPs, topSources, topActions] = await Promise.all([
        this.getTopSourceIPs(where),
        this.getTopLogSources(where),
        this.getTopActions(where),
      ]);

      return {
        topIPs,
        topSources,
        topActions,
      };
    } catch (error) {
      console.error("Error in getTopIPsAndTopSources:", error);
      throw error;
    }
  }

  static async getTopSourceIPs(whereClause) {
    try {
      const topSrcIPs = await prisma.log.groupBy({
        by: ["srcIp"],
        where: {
          ...whereClause,
          srcIp: {
            not: null, // Exclude null values
            not: "", // Exclude empty strings
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 7, // Limit to top 7
      });

      // Transform to consistent format
      return topSrcIPs.map((item) => ({
        ip: item.srcIp,
        count: item._count.id,
      }));
    } catch (error) {
      console.error("Error in getTopSourceIPs:", error);
      throw error;
    }
  }

  static async getTopLogSources(whereClause) {
    try {
      const sourceCounts = await prisma.log.groupBy({
        by: ["source"],
        where: whereClause,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 7, // Limit to top 7
      });

      // Transform to consistent format
      return sourceCounts.map((item) => ({
        source: item.source || "Unknown",
        count: item._count.id,
      }));
    } catch (error) {
      console.error("Error in getTopLogSources:", error);
      throw error;
    }
  }

  static async getTopActions(whereClause) {
    try {
      const actionCounts = await prisma.log.groupBy({
        by: ["action"],
        where: {
          ...whereClause,
          action: {
            not: null, // Exclude null values
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 7, // Limit to top 7
      });

      // Transform to consistent format
      return actionCounts.map((item) => ({
        action: item.action || "Unknown",
        count: item._count.id,
      }));
    } catch (error) {
      console.error("Error in getTopActions:", error);
      throw error;
    }
  }
}
