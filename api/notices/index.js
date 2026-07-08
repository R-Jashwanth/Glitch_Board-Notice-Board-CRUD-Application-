// VERCEL SERVERLESS FUNCTION - GET & POST /api/notices
import prisma from "../../lib/prisma.js";
import { validateNotice } from "../../utils/validation.js";

export default async function handler(req, res) {
  const { method } = req;

  // Enable CORS for Vercel deployments
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  // EXPOSE CONNECTION METRIC TO NETWORK CONSOLE
  res.setHeader("x-database-mode", prisma.isFallbackActive ? "fallback" : "cloud");

  // SYSTEM LOG
  console.log(`[SYS_API] NETWORK CALL ROUTED: ${method} -> /api/notices`);

  switch (method) {
    case "GET":
      try {
        const notices = await prisma.notice.findMany({
          orderBy: [
            {
              priority: "desc", // 'Urgent' precedes 'Normal'
            },
            {
              publishDate: "desc", // Newest notices first within the priority tier
            },
          ],
        });

        return res.status(200).json(notices);
      } catch (error) {
        console.warn("[SYS_API_WAR] GET /api/notices failed:", error.message || error);
        return res.status(500).json({
          error: "DATABASE CORRUPTION",
          details: error.message || String(error),
        });
      }

    case "POST":
      try {
        const payload = req.body;

        // SERVER-SIDE SECURITY CHECK
        const { isValid, errors } = validateNotice(payload);
        if (!isValid) {
          return res.status(400).json({
            error: "TRANSMISSION_REJECTED",
            message: "SERVER VALIDATION FAILED",
            validationErrors: errors,
          });
        }

        // PERSISTENCE MATRIX WRITING
        const newNotice = await prisma.notice.create({
          data: {
            title: payload.title,
            body: payload.body,
            category: payload.category,
            priority: payload.priority,
            publishDate: new Date(payload.publishDate),
            image: payload.image || null,
          },
        });

        return res.status(201).json(newNotice);
      } catch (error) {
        console.warn("[SYS_API_WAR] POST /api/notices failed:", error.message || error);
        return res.status(500).json({
          error: "PERSISTENCE_FAILURE",
          details: error.message || String(error),
        });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({
        error: `METHOD_${method}_NOT_ALLOWED`,
      });
  }
}
