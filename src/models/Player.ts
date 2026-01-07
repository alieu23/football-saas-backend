import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import { Club } from "./Club";
import { Team } from "./Team";
import { PlayerContract } from "./PlayerContract";
import { PlayerLoan } from "./PlayerLoan";
import { PlayerTransfer } from "./PlayerTransfer";

@Table({ tableName: "players" })
export class Player extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column(DataType.STRING)
  position?: string;

  @Column(DataType.INTEGER)
  jerseyNo?: number;

  @Column(DataType.STRING)
  profilePhotoKey?: string;

  @Column(DataType.STRING)
  profilePhotoUrl?: string;

  @ForeignKey(() => Club)
  @Column(DataType.INTEGER)
  clubId!: number;

  @BelongsTo(() => Club)
  club!: Club;

  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  teamId?: number;

  @BelongsTo(() => Team)
  team?: Team;

  @HasMany(() => PlayerContract)
  contracts!: PlayerContract[];

  @HasMany(() => PlayerLoan)
  loans!: PlayerLoan[];

  @HasMany(() => PlayerTransfer)
  transfers!: PlayerTransfer[];
}
