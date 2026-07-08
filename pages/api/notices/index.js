// PAGES/API/NOTICES/INDEX.JS - ENDPOINT MATRIX
import prisma from "../../../lib/prisma.js";
import { validateNotice } from "../../../utils/validation.js";

export default async function handler(req, res) {
  const { method } = req;

  // EXPOSE CONNECTION METRIC TO NETWORK CONSOLE
  res.setHeader("x-database-mode", prisma.isFallbackActive ? "fallback" : "cloud");

  // SYSTEM LOG
  console.log(`[SYS_API] NETWORK CALL ROUTED: ${method} -> /api/notices`);

  switch (method) {
    case "GET":
      try {
        // URGENT PRIORITY RULE ENFORCEMENT:
        // 'Urgent' starts with 'U' (ASCII 85), 'Normal' starts with 'N' (ASCII 78).
        // Sorting priority in DESCENDING order puts 'Urgent' before 'Normal'.
        // This sorting is handled entirely in Prisma Client query.
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
