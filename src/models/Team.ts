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
import { Player } from "./Player";

@Table({ tableName: "teams" })
export class Team extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column(DataType.STRING)
  category?: string; // U13, U17, Senior

  @ForeignKey(() => Club)
  @Column(DataType.INTEGER)
  clubId!: number;

  @BelongsTo(() => Club)
  club!: Club;

  @HasMany(() => Player)
  players!: Player[];
}
