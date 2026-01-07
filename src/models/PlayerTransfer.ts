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

export enum TransferStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum TransferType {
  SALE = "SALE",
  FREE = "FREE",
  EXCHANGE = "EXCHANGE"
}

@Table({ tableName: "player_transfers" })
export class PlayerTransfer extends Model {
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

  @Column(DataType.DECIMAL)
  transferFee?: number;

  @Column({ type: DataType.STRING, defaultValue: "USD" })
  currency!: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransferType)),
    defaultValue: TransferType.SALE
  })
  transferType!: TransferType;

  @Column({
    type: DataType.ENUM(...Object.values(TransferStatus)),
    defaultValue: TransferStatus.PENDING
  })
  status!: TransferStatus;

  @Column(DataType.DATE)
  transferDate!: Date;

  @Column(DataType.TEXT)
  notes?: string;
}
