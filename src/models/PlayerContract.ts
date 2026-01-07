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

export enum ContractStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED"
}

export enum ContractType {
  PROFESSIONAL = "PROFESSIONAL",
  AMATEUR = "AMATEUR",
  YOUTH = "YOUTH"
}

export enum SalaryFrequency {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY"
}

@Table({ tableName: "player_contracts" })
export class PlayerContract extends Model {
  @ForeignKey(() => Player)
  @Column(DataType.INTEGER)
  playerId!: number;

  @BelongsTo(() => Player)
  player!: Player;

  @ForeignKey(() => Club)
  @Column(DataType.INTEGER)
  clubId!: number;

  @BelongsTo(() => Club)
  club!: Club;

  @Column(DataType.DATE)
  startDate!: Date;

  @Column(DataType.DATE)
  endDate!: Date;

  @Column(DataType.DECIMAL)
  salary?: number;

  @Column({
    type: DataType.ENUM(...Object.values(SalaryFrequency)),
    defaultValue: SalaryFrequency.MONTHLY
  })
  salaryFrequency!: SalaryFrequency;

  @Column({
    type: DataType.ENUM(...Object.values(ContractType)),
    defaultValue: ContractType.PROFESSIONAL
  })
  contractType!: ContractType;

  @Column({
    type: DataType.ENUM(...Object.values(ContractStatus)),
    defaultValue: ContractStatus.UPCOMING
  })
  status!: ContractStatus;

  @Column(DataType.STRING)
  documentKey?: string;

  @Column(DataType.STRING)
  documentUrl?: string;


  @Column(DataType.TEXT)
  notes?: string;
}
