import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { Club } from "./Club";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  CLUB_ADMIN = "CLUB_ADMIN",
  COACH = "COACH",
  STAFF = "STAFF",
  PLAYER = "PLAYER"
}

@Table({ tableName: "users" })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  passwordHash!: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.STAFF
  })
  role!: UserRole;

  @ForeignKey(() => Club)
  @Column(DataType.INTEGER)
  clubId?: number;

  @BelongsTo(() => Club)
  club?: Club;
}
