import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'category' })
export class CategoryDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  subcategories?: string[];
}
