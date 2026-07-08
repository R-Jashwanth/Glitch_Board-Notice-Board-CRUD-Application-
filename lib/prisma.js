// PRISMA CLIENT CONDUIT - PERSISTENT DB INTERRUPT INTERFACE WITH AUTOMATIC LOCAL FALLBACK
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const FALLBACK_FILE_PATH = path.join(process.cwd(), "prisma", "notices_fallback.json");

// High-quality, glitch-themed starter notices for the fallback mode
const DEFAULT_NOTICES = [
  {
    id: "fb-node-001",
    title: "GRID COUPLING ERROR: SYSTEM LOCALIZED Failsafe ACTIVE",
    body: "Operational node sector-4 database credentials invalid or offline. All decentralized networks are automatically routing transmissions through the local file system grid. PERSISTENCE STABLE.",
    category: "General",
    priority: "Urgent",
    publishDate: new Date().toISOString(),
    image: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "fb-node-002",
    title: "MID-TERM MATRIX DIAGNOSTIC SCHEDULE",
    body: "Notice to all system processes: Core memory segments will undergo mandatory optimization protocols starting 04:00 UTC. Ensure local buffers are flushed.",
    category: "Exam",
    priority: "Normal",
    publishDate: new Date(Date.now() - 86400000).toISOString(),
    image: null,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "fb-node-003",
    title: "ANNUAL NETWORKING EVENT",
    body: "Main lobby router. Meet your local developers and network nodes. Synthesizers, coffee, and static noises will be supplied.",
    category: "Event",
    priority: "Normal",
    publishDate: new Date(Date.now() - 172800000).toISOString(),
    image: null,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

function readFallbackData() {
  try {
    if (!fs.existsSync(FALLBACK_FILE_PATH)) {
      const dir = path.dirname(FALLBACK_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(DEFAULT_NOTICES, null, 2));
      return DEFAULT_NOTICES;
    }
    const raw = fs.readFileSync(FALLBACK_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[SYS_DB_FALLBACK] Failed to read fallback datastore:", err);
    return DEFAULT_NOTICES;
  }
}

function writeFallbackData(data) {
  try {
    const dir = path.dirname(FALLBACK_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn("[SYS_DB_FALLBACK] Failed to write fallback datastore:", err);
  }
}

// In-Memory fallback implementation mimicking Prisma API for 'notice'
const fallbackNotice = {
  findMany: async (args) => {
    console.warn("[SYS_DB_FALLBACK] Running local file query: findMany");
    const list = readFallbackData();
    
    // Sort logic matching standard Prisma order: priority DESC, publishDate DESC
    list.sort((a, b) => {
      const pA = a.priority === "Urgent" ? 2 : 1;
      const pB = b.priority === "Urgent" ? 2 : 1;
      if (pA !== pB) {
        return pB - pA;
      }
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
    
    return list;
  },

  findUnique: async (args) => {
    console.warn("[SYS_DB_FALLBACK] Running local file query: findUnique");
    const { where } = args;
    const list = readFallbackData();
    const found = list.find(item => item.id === String(where.id));
    return found || null;
  },

  create: async (args) => {
    console.warn("[SYS_DB_FALLBACK] Running local file insertion: create");
    const { data } = args;
    const list = readFallbackData();
    const newRecord = {
      id: "node-" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11),
      title: data.title,
      body: data.body,
      category: data.category,
      priority: data.priority,
      publishDate: data.publishDate instanceof Date ? data.publishDate.toISOString() : data.publishDate,
      image: data.image || null,
      createdAt: new Date().toISOString()
    };
    list.push(newRecord);
    writeFallbackData(list);
    return newRecord;
  },

  update: async (args) => {
    console.warn("[SYS_DB_FALLBACK] Running local file modification: update");
    const { where, data } = args;
    const list = readFallbackData();
    const index = list.findIndex(item => item.id === String(where.id));
    if (index === -1) {
      throw new Error(`Record not found for id [${where.id}]`);
    }
    
    const updatedRecord = {
      ...list[index],
      title: data.title !== undefined ? data.title : list[index].title,
      body: data.body !== undefined ? data.body : list[index].body,
      category: data.category !== undefined ? data.category : list[index].category,
      priority: data.priority !== undefined ? data.priority : list[index].priority,
      publishDate: data.publishDate !== undefined 
        ? (data.publishDate instanceof Date ? data.publishDate.toISOString() : data.publishDate)
        : list[index].publishDate,
      image: data.image !== undefined ? data.image : list[index].image,
    };
    
    list[index] = updatedRecord;
    writeFallbackData(list);
    return updatedRecord;
  },

  delete: async (args) => {
    console.warn("[SYS_DB_FALLBACK] Running local file purge: delete");
    const { where } = args;
    const list = readFallbackData();
    const filtered = list.filter(item => item.id !== String(where.id));
    writeFallbackData(filtered);
    return { id: where.id };
  }
};

let actualPrisma;
try {
  actualPrisma = new PrismaClient();
} catch (err) {
  console.warn("[SYS_DB] Suppressed initialization message.");
}

// Check if database connectivity environment is healthy
function isDatabaseHealthy() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl || dbUrl.includes("[PASSWORD]") || dbUrl.includes("placeholder")) {
    return false;
  }
  return true;
}

// Track database connection failure dynamically to prevent slow retry lags once verified offline
let dbForceOffline = !isDatabaseHealthy();

const prismaNoticeProxy = new Proxy((actualPrisma && actualPrisma.notice) || {}, {
  get(target, prop) {
    return async function(...args) {
      // If environment flags direct us offline, immediately skip to fallback store
      if (dbForceOffline) {
        if (fallbackNotice[prop]) {
          return await fallbackNotice[prop](...args);
        }
      }

      try {
        const originalMethod = target[prop];
        if (typeof originalMethod !== "function") {
          throw new Error(`Prisma model 'notice' does not have method '${String(prop)}'`);
        }
        return await originalMethod.apply(target, args);
      } catch (err) {
        const errMsg = String(err);
        const isConnError = 
          errMsg.includes("Initialization") || 
          errMsg.includes("Authentication") || 
          errMsg.includes("credentials") || 
          errMsg.includes("connection") || 
          errMsg.includes("PrismaClientInitializationError") ||
          errMsg.includes("Can't reach database server") ||
          errMsg.includes("postgres");

        if (isConnError) {
          console.log("[SYS_DB_FALLBACK] Routing through failsafe local storage grid.");
          dbForceOffline = true; // Stay in fallback mode for performance
          if (fallbackNotice[prop]) {
            return await fallbackNotice[prop](...args);
          }
        }
        throw err;
      }
    };
  }
});

// Primary exported prisma connection proxy
const prismaProxy = new Proxy(actualPrisma || {}, {
  get(target, prop) {
    if (prop === "notice") {
      return prismaNoticeProxy;
    }
    if (prop === "isFallbackActive") {
      return dbForceOffline;
    }
    return target[prop];
  }
});

export default prismaProxy;
