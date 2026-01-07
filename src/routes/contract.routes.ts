import {Router } from "express";
import {
    createContract,
    deleteContractDocument,
    downloadContract,
    listContracts,
    listPlayerContracts,
    renewContract,
    terminateContract,
    uploadContractDocument
} from "../controllers/contract.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/User";
import { uploadMemory } from "../utils/upload";

const contractRoutes = Router();

/* CLUB ADMIN */
contractRoutes.post(
    "/",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    createContract
);

contractRoutes.get(
    "/",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    listContracts
);

contractRoutes.get(
    "/player/:playerId",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    listPlayerContracts
);

contractRoutes.put(
    "/:id/renew",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    renewContract
);

contractRoutes.put(
    "/:id/terminate",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    terminateContract
);
contractRoutes.post(
    "/:id/contract-document",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    uploadMemory.single("file"),
    uploadContractDocument
);

contractRoutes.get(
  "/:id/download",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  downloadContract
);

contractRoutes.delete(
  "/:id/document",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  deleteContractDocument
);
export default contractRoutes;
