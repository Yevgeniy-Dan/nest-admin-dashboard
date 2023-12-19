import { IsMongoId } from 'class-validator';

export class ParamsWithIdDto {
  @IsMongoId()
  id: string;
}
