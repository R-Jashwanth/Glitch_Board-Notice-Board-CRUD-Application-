// PAGES/API/NOTICES/[ID].JS - DYNAMIC CONDUIT MATRIX
import prisma from "../../../lib/prisma.js";
import { validateNotice } from "../../../utils/validation.js";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  // EXPOSE CONNECTION METRIC TO NETWORK CONSOLE
  res.setHeader("x-database-mode", prisma.isFallbackActive ? "fallback" : "cloud");

  // SYSTEM LOG
  console.log(`[SYS_API] NETWORK CALL ROUTED: ${method} -> /api/notices/${id}`);

  if (!id) {
    return res.status(400).json({ error: "NODE ID NOT PROVIDED" });
  }

  switch (method) {
    case "GET":
      try {
        const notice = await prisma.notice.findUnique({
          where: { id: String(id) },
        });

        if (!notice) {
          return res.status(404).json({
            error: "NODE_NOT_FOUND",
            message: `Notice node [${id}] is not registered in the network grid`,
          });
        }

        return res.status(200).json(notice);
      } catch (error) {
        console.warn(`[SYS_API_WAR] GET /api/notices/${id} failed:`, error.message || error);
        return res.status(500).json({
          error: "DATABASE CORRUPTION",
          details: error.message || String(error),
        });
      }

    case "PUT":
      try {
        const payload = req.body;

        // SERVER-SIDE SECURITY CHECK
        const { isValid, errors } = validateNotice(payload);
        if (!isValid) {
          return res.status(400).json({
            error: "TRANSMISSION_REJECTED",
            message: "SERVER VALIDATION FAILED ON REWRITE",
            validationErrors: errors,
          });
        }

        // VERIFY NODE EXISTENCE BEFORE WRITING
        const existingNotice = await prisma.notice.findUnique({
          where: { id: String(id) },
        });

        if (!existingNotice) {
          return res.status(404).json({
            error: "NODE_NOT_FOUND",
            message: `Cannot rewrite. Notice node [${id}] does not exist.`,
          });
        }

        // PERSISTENCE MATRIX UPDATE
        const updatedNotice = await prisma.notice.update({
          where: { id: String(id) },
          data: {
            title: payload.title,
            body: payload.body,
            category: payload.category,
            priority: payload.priority,
            publishDate: new Date(payload.publishDate),
            image: payload.image || null,
          },
        });

        return res.status(200).json(updatedNotice);
      } catch (error) {
        console.warn(`[SYS_API_WAR] PUT /api/notices/${id} failed:`, error.message || error);
        return res.status(500).json({
          error: "REWRITE_FAILURE",
          details: error.message || String(error),
        });
      }

    case "DELETE":
      try {
        // VERIFY NODE EXISTENCE BEFORE PURGING
        const existingNotice = await prisma.notice.findUnique({
          where: { id: String(id) },
        });

        if (!existingNotice) {
          return res.status(404).json({
            error: "NODE_NOT_FOUND",
            message: `Cannot purge. Notice node [${id}] is not active in the grid.`,
          });
        }

        // PURGING FROM DATABASE
        await prisma.notice.delete({
          where: { id: String(id) },
        });

        return res.status(200).json({
          message: `NODE_PURGE_SUCCESSFUL`,
          purgedId: id,
        });
      } catch (error) {
        console.warn(`[SYS_API_WAR] DELETE /api/notices/${id} failed:`, error.message || error);
        return res.status(500).json({
          error: "PURGE_FAILURE",
          details: error.message || String(error),
        });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).json({
        error: `METHOD_${method}_NOT_ALLOWED`,
      });
  }
}
