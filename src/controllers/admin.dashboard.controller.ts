import {Response} from 'express';
import { Player } from '../models/Player';
import { Club } from '../models/Club';
import { User } from '../models/User';
import { PlayerContract } from '../models/PlayerContract';
import { PlayerTransfer } from '../models/PlayerTransfer';


export async function getDashboardStats(_req: any, res: Response) {
    const [
        totalClubs,
        totalPlayers,
        totalUsers,
        recentClubs,
        recentTransfers,
    ]= await Promise.all([
        Club.count(),
        Player.count(),
        User.count(),
        Club.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
        }),
        PlayerTransfer.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
        }),
    ]);
    res.json({
        stats:{
            totalClubs,
            totalPlayers,
            totalUsers,
        },
        recentClubs,
        recentTransfers,
    });
}