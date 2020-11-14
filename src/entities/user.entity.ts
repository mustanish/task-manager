import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude, classToPlain } from 'class-transformer';
import { hash, compare, genSaltSync } from 'bcryptjs';
import { ProfileResponse } from '@taskmanager/responses';
import { Platform, VerificationType } from '@taskmanager/enums';
import { Task } from '@taskmanager/entities';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
  })
  userName: string;

  @Column({
    type: 'varchar',
    length: 15,
    unique: true,
  })
  phone: string;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: [
      Platform.GOOGLE,
      Platform.FACEBOOK,
      Platform.WHATSAPP,
      Platform.NORMAL,
    ],
    default: Platform.NORMAL,
  })
  platform: Platform;

  @Column({ nullable: true })
  @Exclude()
  otp: string;

  @Column({
    type: 'enum',
    enum: [VerificationType.CREATEACCOUNT, VerificationType.FORGOTACCOUNT],
    nullable: true,
  })
  @Exclude()
  otpType: VerificationType;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  otpValidity: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  lastLogedIn: string;

  @OneToMany(
    type => Task,
    task => task.user,
    { eager: true },
  )
  tasks: Task[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'LOCALTIMESTAMP' })
  @Exclude()
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'LOCALTIMESTAMP' })
  @Exclude()
  updatedAt: string;

  async hashOtp(otp: string): Promise<string> {
    return await hash(otp, genSaltSync(10));
  }

  async compareOtp(otp: string): Promise<boolean> {
    return await compare(otp, this.otp);
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, genSaltSync(10));
  }

  async comparePassword(password: string): Promise<boolean> {
    return await compare(password, this.password);
  }

  profile(): ProfileResponse {
    return <ProfileResponse>classToPlain(this);
  }
}
