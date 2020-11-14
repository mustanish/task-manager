import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { classToPlain, Exclude } from 'class-transformer';
import { User } from '@taskmanager/entities';
import { TaskStatus } from '@taskmanager/enums';
import { TaskResponse } from '@taskmanager/responses';
import { type } from 'os';

@Entity()
@Unique('UQ_UniqueTitle', ['title', 'userId'])
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({ default: TaskStatus.OPEN })
  @Exclude()
  status: TaskStatus;

  @Column({ default: false })
  @Exclude()
  deleted: boolean;

  @ManyToOne(
    type => User,
    user => user.tasks,
    { eager: false },
  )
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'tsvector', nullable: true })
  @Exclude()
  searchDocument: any;

  @CreateDateColumn({ type: 'timestamp', default: () => 'LOCALTIMESTAMP' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'LOCALTIMESTAMP' })
  @Exclude()
  updatedAt: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  deletedAt: string;

  task(): TaskResponse {
    return <TaskResponse>classToPlain(this);
  }
}
