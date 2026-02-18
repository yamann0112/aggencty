import { z } from 'zod';
import { 
  insertUserSchema, 
  insertMessageSchema, 
  insertPageSchema, 
  insertEventSchema, 
  insertPkBattleSchema, 
  insertAnnouncementSchema,
  users,
  messages,
  pages,
  events,
  pkBattles,
  announcements
} from './schema';

// Shared Error Schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id' as const,
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages' as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/messages' as const,
      input: z.object({ content: z.string(), replyToId: z.number().optional() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/messages/:id' as const,
      responses: {
        204: z.void(),
      },
    },
  },
  pages: {
    list: {
      method: 'GET' as const,
      path: '/api/pages' as const,
      responses: {
        200: z.array(z.custom<typeof pages.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pages' as const,
      input: insertPageSchema,
      responses: {
        201: z.custom<typeof pages.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/pages/:id' as const,
      input: insertPageSchema.partial(),
      responses: {
        200: z.custom<typeof pages.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/pages/:id' as const,
      responses: {
        204: z.void(),
      },
    },
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
      },
    },
    like: {
      method: 'POST' as const,
      path: '/api/events/:id/like' as const,
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
      },
    },
  },
  pkBattles: {
    list: {
      method: 'GET' as const,
      path: '/api/pk-battles' as const,
      responses: {
        200: z.array(z.custom<typeof pkBattles.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pk-battles' as const,
      input: insertPkBattleSchema,
      responses: {
        201: z.custom<typeof pkBattles.$inferSelect>(),
      },
    },
  },
  announcements: {
    get: {
      method: 'GET' as const,
      path: '/api/announcements' as const,
      responses: {
        200: z.array(z.custom<typeof announcements.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/announcements' as const,
      input: insertAnnouncementSchema,
      responses: {
        201: z.custom<typeof announcements.$inferSelect>(),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:key' as const,
      responses: {
        200: z.object({ value: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    set: {
      method: 'POST' as const,
      path: '/api/settings' as const,
      input: z.object({ key: z.string(), value: z.string() }),
      responses: {
        200: z.object({ key: z.string(), value: z.string() }),
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
