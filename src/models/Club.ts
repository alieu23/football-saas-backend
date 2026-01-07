import {
  Table,
  Column,
  Model,
  DataType,
  HasMany
} from "sequelize-typescript";
import { User } from "./User";
import { Team } from "./Team";
import { Player } from "./Player";

@Table({ tableName: "clubs" })
export class Club extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;
  @Column(DataType.STRING)
  logoKey?: string;

  @Column(DataType.STRING)
  logoUrl?: string;

  @Column(DataType.STRING)
  country?: string;

  @HasMany(() => User)
  users!: User[];

  @HasMany(() => Team)
  teams!: Team[];

  @HasMany(() => Player)
  players!: Player[];
}
