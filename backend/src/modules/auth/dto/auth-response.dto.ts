import { ProfileResponseDto } from "../../users/dto/profile-response.dto";

export interface AuthResponseDto {
  accessToken: string;
  profile: ProfileResponseDto;
}
