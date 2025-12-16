import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLookupDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}




