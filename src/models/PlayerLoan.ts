import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { Player } from "./Player";
import { Club } from "./Club";
import { Team } from "./Team";

export enum LoanStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  TERMINATED = "TERMINATED"
}

@Table({ tableName: "player_loans" })
export class PlayerLoan extends Model {
  @ForeignKey(() => Player)
  @Column(DataType.INTEGER)
  playerId!: number;

  @BelongsTo(() => Player)
  player!: Player;

  @ForeignKey(() => Club)
  @Column(DataType.INTEGER)
  fromClubId!: number;

  @ForeignKey(() => Club)
  @Column(DataType.INTEGER)
  toClubId!: number;

  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  fromTeamId?: number;

  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  toTeamId!: number;

  @Column(DataType.DATE)
  startDate!: Date;

  @Column(DataType.DATE)
  endDate!: Date;

  @Column({
    type: DataType.ENUM(...Object.values(LoanStatus)),
    defaultValue: LoanStatus.UPCOMING
  })
  status!: LoanStatus;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  recallable!: boolean;

  @Column(DataType.TEXT)
  notes?: string;
}
