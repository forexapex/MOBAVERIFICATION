import { type BotStatus, type InsertBotStatus, type VerificationRequest, type InsertVerificationRequest } from "@shared/schema";

export interface IStorage {
  getBotStatus(): Promise<BotStatus[]>;
  createVerificationRequest(req: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequests(guildId: string): Promise<VerificationRequest[]>;
  approveVerification(id: number, approvedBy: string): Promise<void>;
  denyVerification(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private status: BotStatus[] = [{ id: 1, status: "Running", lastUpdated: new Date().toISOString() }];
  private verifications: VerificationRequest[] = [];
  private idCounter = 1;

  async getBotStatus(): Promise<BotStatus[]> {
    return this.status;
  }

  async createVerificationRequest(req: InsertVerificationRequest): Promise<VerificationRequest> {
    const verification: VerificationRequest = {
      id: this.idCounter++,
      ...req,
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
}

export const storage = new MemStorage();
