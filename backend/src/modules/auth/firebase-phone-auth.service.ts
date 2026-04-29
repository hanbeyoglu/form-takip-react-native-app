import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  isValidTurkishMobile,
  normalizePhoneNumber
} from "../../common/utils/phone.util";

type FirebaseLookupResponse = {
  users?: Array<{
    localId?: string;
    phoneNumber?: string;
  }>;
  error?: {
    message?: string;
  };
};

@Injectable()
export class FirebasePhoneAuthService {
  constructor(private readonly configService: ConfigService) {}

  async verifyPhoneIdentityToken(params: {
    idToken: string;
    expectedPhoneNumber: string;
  }): Promise<{ phoneNumber: string; firebaseUid: string | null }> {
    const apiKey = this.configService.get<string>("firebase.apiKey");
    const projectId = this.configService.get<string>("firebase.projectId");

    if (!apiKey || !projectId) {
      throw new InternalServerErrorException("Firebase phone auth is not configured");
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idToken: params.idToken
        })
      }
    );

    const payload = (await response.json()) as FirebaseLookupResponse;
    const phoneNumber = payload.users?.[0]?.phoneNumber;
    const firebaseUid = payload.users?.[0]?.localId ?? null;

    if (!response.ok || !phoneNumber) {
      throw new UnauthorizedException("Firebase verification failed");
    }

    const normalizedExpectedPhoneNumber = normalizePhoneNumber(params.expectedPhoneNumber);
    const normalizedVerifiedPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (
      !isValidTurkishMobile(normalizedExpectedPhoneNumber)
      || !isValidTurkishMobile(normalizedVerifiedPhoneNumber)
    ) {
      throw new UnauthorizedException("Firebase phone number is invalid");
    }

    if (normalizedExpectedPhoneNumber !== normalizedVerifiedPhoneNumber) {
      throw new UnauthorizedException("Firebase phone number mismatch");
    }

    return {
      phoneNumber: normalizedVerifiedPhoneNumber,
      firebaseUid
    };
  }
}
