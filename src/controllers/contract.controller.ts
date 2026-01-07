import { Response } from "express";
import {z} from "zod";
import {Op} from "sequelize";
import  {Player} from "../models/Player";
import {
    PlayerContract,
    ContractStatus,
    ContractType,
    SalaryFrequency
} from "../models/PlayerContract";
import { uploadToS3 } from "../utils/s3Uploads";
import { getSignedDownloadUrl } from "../utils/s3SignedUrl";
import { deleteFromS3 } from "../utils/s3Delete";
import { AuthRequest } from "../middleware/auth.middleware";


export async function uploadContractDocument(req: AuthRequest, res: Response) {
    if (!req.user || !req.user.clubId) {
        return res.status(400).json({ message: "No club assigned to user" });
    }
    if (req.file?.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF files are allowed" });

    }
    const contract = await PlayerContract.findOne({
        where: {
            id: Number(req.params.id),
            clubId: req.user.clubId
        }
    });
    if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
    }
    if (contract.documentKey) {
        await deleteFromS3(contract.documentKey);
    }
    const { key, url } = await uploadToS3(req.file, "contracts");

    contract.documentKey = key;
    contract.documentUrl = url;
    await contract.save();
    res.json({
        message: "Contract document uploaded",
        contractDocumentUrl: url
    });
}

export async function downloadContract(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const contract = await PlayerContract.findOne({
    where: {
      id: Number(req.params.id),
      clubId: req.user.clubId
    }
  });

  if (!contract || !contract.documentKey) {
    return res.status(404).json({ message: "Document not found" });
  }

  const signedUrl = await getSignedDownloadUrl(contract.documentKey);

  res.json({
    downloadUrl: signedUrl,
    expiresIn: "5 minutes"
  });
}

export async function deleteContractDocument(
  req: AuthRequest,
  res: Response
) {
  const contract = await PlayerContract.findOne({
    where: {
      id: Number(req.params.id),
      clubId: req.user?.clubId
    }
  });

  if (!contract || !contract.documentKey) {
    return res.status(404).json({ message: "No document to delete" });
  }

  await deleteFromS3(contract.documentKey);

  contract.documentKey = null!;
  contract.documentUrl = null!;
  await contract.save();

  res.json({ message: "Contract document deleted" });
}

/* -----------------------
   Validation
----------------------- */
const createContractSchema = z.object({
    playerId: z.number().int().positive(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    salary: z.number().optional(),
    salaryFrequency: z.nativeEnum(SalaryFrequency).optional(),
    contractType: z.nativeEnum(ContractType).optional(),
    notes: z.string().optional()
  
});

const renewContractSchema = z.object({
    newEndDate: z.string().datetime(),
    newSalary: z.number().optional(),
    notes: z.string().optional()
});

/* -----------------------
    HELPERS
----------------------- */

function computeStatus(start: Date, end: Date): ContractStatus {
    const now = new Date();
    if (now < start) return ContractStatus.UPCOMING;
    if (now >= start && now <= end) return ContractStatus.ACTIVE;
    return ContractStatus.EXPIRED;
}


/* -----------------------
   CREATE CONTRACT
----------------------- */
export const createContract = async (req: AuthRequest, res: Response) => {
if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }
    const data = createContractSchema.parse(req.body);

    const player = await Player.findOne({
        where: {
            id: data.playerId,
            clubId: req.user.clubId
        }
    });

    if (!player) {
        return res.status(404).json({ message: "Player not found" });
    }

    const activeContract = await PlayerContract.findOne({
        where: {
            playerId: player.id,
            status: ContractStatus.ACTIVE
        }
    });
    if (activeContract) {
        return res.status(409).json({ message: "Player already has an active contract" });
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const contract = await PlayerContract.create({
        playerId: player.id,
        clubId: req.user.clubId,
        startDate,
        endDate,
        salary: data.salary,
        salaryFrequency: data.salaryFrequency ?? SalaryFrequency.MONTHLY,
        contractType: data.contractType ?? ContractType.PROFESSIONAL,
        notes: data.notes,
        status: computeStatus(startDate, endDate)
    });

    res.status(201).json({ contract, message: "Contract created successfully" });
}

/* -----------------------
   LIST CONTRACTS (CLUB => ALL PLAYER CONTRACTS)
----------------------- */
export const listContracts = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }

    const contracts = await PlayerContract.findAll({
        where: { clubId: req.user.clubId },
        include: ["Player"],
        order: [["createdAt", "DESC"]]
    });

    res.json(contracts);
};

/* -----------------------
    LIST PLAYER CONTRACTS
----------------------- */
export const listPlayerContracts = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }

    const contracts = await PlayerContract.findAll({
        where: { 
            clubId: req.user.clubId,
            playerId: req.params.playerId 
        },
        order: [["createdAt", "DESC"]],
    });

    res.json(contracts);
};

/* -----------------------
   RENEW CONTRACT
----------------------- */
export const renewContract = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }
    const data = renewContractSchema.parse(req.body);

    const contract = await PlayerContract.findOne({
        where: {
            id: Number(req.params.id),
            clubId: req.user.clubId
        }
    });

    if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
    }

    contract.endDate = new Date(data.newEndDate);
    contract.salary = data.newSalary || contract.salary;
    contract.notes = data.notes || contract.notes;
    contract.status = computeStatus(contract.startDate, contract.endDate);

    await contract.save();

    res.json({ contract, message: "Contract renewed successfully" });
};

/* -----------------------
   TERMINATE CONTRACT
----------------------- */

export async function terminateContract(req: AuthRequest, res: Response) {
  const contract = await PlayerContract.findOne({
    where: {
      id: Number(req.params.id),
      clubId: req.user?.clubId
    }
  });

  if (!contract) {
    return res.status(404).json({ message: "Contract not found" });
  }

  contract.status = ContractStatus.TERMINATED;
  await contract.save();

  res.json({ message: "Contract terminated", contract });
}

