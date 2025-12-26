import { type BotStatus, type InsertBotStatus, type VerificationRequest, type InsertVerificationRequest, type UserRanks, type InsertUserRanks } from "@shared/schema";

export interface IStorage {
  getBotStatus(): Promise<BotStatus[]>;
  createVerificationRequest(req: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequests(guildId: string): Promise<VerificationRequest[]>;
  approveVerification(id: number, approvedBy: string): Promise<void>;
  denyVerification(id: number): Promise<void>;
  getUserRank(userId: string): Promise<UserRanks | undefined>;
  updateUserRank(userId: string, data: Partial<UserRanks>): Promise<UserRanks>;
}

export class MemStorage implements IStorage {
  private status: BotStatus[] = [{ id: 1, status: "Running", lastUpdated: new Date().toISOString() }];
  private verifications: VerificationRequest[] = [];
  private userRanks: UserRanks[] = [];
  private idCounter = 1;
  private rankIdCounter = 1;

  async getBotStatus(): Promise<BotStatus[]> {
    return this.status;
  }

  async createVerificationRequest(req: InsertVerificationRequest): Promise<VerificationRequest> {
    const verification: VerificationRequest = {
      id: this.idCounter++,
      ...req,
      status: req.status || 'pending',
      approvedBy: req.approvedBy || null,
      createdAt: new Date(),
      approvedAt: null,
    };
    this.verifications.push(verification);
    return verification;
  }

  async getVerificationRequests(guildId: string): Promise<VerificationRequest[]> {
    return this.verifications.filter(v => v.guildId === guildId && v.status === 'pending');
  }

  async approveVerification(id: number, approvedBy: string): Promise<void> {
    const v = this.verifications.find(v => v.id === id);
    if (v) {
      v.status = 'approved';
      v.approvedBy = approvedBy;
      v.approvedAt = new Date();
    }
  }

  async denyVerification(id: number): Promise<void> {
    const v = this.verifications.find(v => v.id === id);
    if (v) {
      v.status = 'denied';
    }
  }

  async getUserRank(userId: string): Promise<UserRanks | undefined> {
    return this.userRanks.find(r => r.userId === userId);
  }

  async updateUserRank(userId: string, data: Partial<UserRanks>): Promise<UserRanks> {
    const existingIndex = this.userRanks.findIndex(r => r.userId === userId);
    if (existingIndex >= 0) {
      this.userRanks[existingIndex] = { ...this.userRanks[existingIndex], ...data, updatedAt: new Date() };
      return this.userRanks[existingIndex];
    } else {
      const newRank: UserRanks = {
        id: this.rankIdCounter++,
        userId,
        guildId: data.guildId || "",
        mlbbId: data.mlbbId || "",
        serverId: data.serverId || "",
        playerName: data.playerName || null,
        currentRank: data.currentRank || null,
        division: data.division || null,
        previousRank: data.previousRank || null,
        stars: data.stars || 0,
        points: data.points || 0,
        roleId: data.roleId || null,
        stats: data.stats || null,
        lastStatsUpdate: data.lastStatsUpdate || null,
        lastChecked: data.lastChecked || null,
        rankChangedAt: data.rankChangedAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.userRanks.push(newRank);
      return newRank;
    }
  }
}

export const storage = new MemStorage();
