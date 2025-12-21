import { z } from 'zod';
import { insertBotStatusSchema, botStatus } from './schema';

export const api = {
  status: {
    get: {
      method: 'GET' as const,
      path: '/api/status',
      responses: {
        200: z.array(z.custom<typeof botStatus.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
