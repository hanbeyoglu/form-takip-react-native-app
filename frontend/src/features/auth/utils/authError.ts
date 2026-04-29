import { fallbackLanguage } from "../../../localization/config";
import { i18n } from "../../../localization/i18n";
import { ApiClientError } from "../../../services/api/client";

function translate(key: string, defaultValue: string): string {
  if (i18n.exists(key)) {
    return i18n.t(key);
  }

  const fallbackValue = i18n.t(key, {
    lng: fallbackLanguage,
    defaultValue
  });

  if (fallbackValue && fallbackValue !== key) {
    return fallbackValue;
  }

  return defaultValue;
}

export function mapAuthError(error: unknown, fallbackKey: string): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const firebaseCode = String((error as { code?: string }).code ?? "");

    switch (firebaseCode) {
      case "auth/invalid-phone-number":
        return translate(
          "auth.errors.invalidPhoneNumber",
          "Lütfen geçerli bir Türkiye cep telefonu numarası gir."
        );
      case "auth/invalid-verification-code":
      case "auth/missing-verification-code":
        return translate(
          "auth.errors.invalidOtp",
          "Girdiğin doğrulama kodu hatalı. Kodu kontrol edip tekrar dene."
        );
      case "auth/code-expired":
      case "auth/session-expired":
        return translate(
          "auth.errors.otpExpired",
          "Doğrulama kodunun süresi dolmuş. Yeni bir kod isteyip tekrar deneyebilirsin."
        );
      case "auth/too-many-requests":
      case "auth/quota-exceeded":
        return translate(
          "auth.errors.tooManyRequests",
          "Kısa süre içinde çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar dene."
        );
      case "auth/network-request-failed":
        return translate(
          "auth.errors.network",
          "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene."
        );
      default:
        break;
    }
  }

  if (error instanceof ApiClientError) {
    if (error.code === "NETWORK_ERROR") {
      return translate(
        "auth.errors.network",
        "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene."
      );
    }

    switch (error.message) {
      case "Phone number already in use":
        return translate(
          "auth.errors.phoneInUse",
          "Bu numara zaten kayıtlı. Giriş yapmayı deneyebilirsin."
        );
      case "Registration OTP was not requested":
        return translate(
          "auth.errors.otpNotRequested",
          "Bu numara için önce doğrulama kodu istemen gerekiyor."
        );
      case "OTP has expired":
        return translate(
          "auth.errors.otpExpired",
          "Doğrulama kodunun süresi dolmuş. Yeni bir kod isteyip tekrar deneyebilirsin."
        );
      case "Invalid OTP":
        return translate(
          "auth.errors.invalidOtp",
          "Girdiğin doğrulama kodu hatalı. Kodu kontrol edip tekrar dene."
        );
      case "Invalid credentials":
        return translate(
          "auth.errors.invalidCredentials",
          "Telefon numarası veya şifre hatalı."
        );
      case "Registration session expired":
      case "Invalid registration session":
      case "Registration is not ready to complete":
        return translate(
          "auth.errors.registrationSessionExpired",
          "Kayıt oturumu geçersiz ya da süresi dolmuş. Lütfen telefon doğrulamasını yeniden başlat."
        );
      case "Phone number not found":
        return translate(
          "auth.errors.phoneNotFound",
          "Bu numarayla kayıtlı bir hesap bulamadık."
        );
      case "Password reset OTP was not requested":
        return translate(
          "auth.errors.resetOtpNotRequested",
          "Bu numara için önce şifre sıfırlama kodu istemen gerekiyor."
        );
      case "Password reset session expired":
      case "Invalid password reset session":
      case "Password reset is not ready to complete":
        return translate(
          "auth.errors.passwordResetSessionExpired",
          "Şifre sıfırlama oturumu geçersiz ya da süresi dolmuş. Lütfen akışı yeniden başlat."
        );
      case "Password reset session missing":
        return translate(
          "auth.errors.passwordResetSessionExpired",
          "Şifre sıfırlama oturumu geçersiz ya da süresi dolmuş. Lütfen akışı yeniden başlat."
        );
      case "Only Turkish GSM phone numbers are allowed":
        return translate(
          "auth.errors.invalidPhoneNumber",
          "Lütfen geçerli bir Türkiye cep telefonu numarası gir."
        );
      case "Firebase verification failed":
      case "Firebase phone number mismatch":
      case "Firebase phone auth is not configured":
        return translate(
          "auth.errors.firebaseVerificationFailed",
          "Telefon doğrulaması tamamlanamadı. Lütfen kodu yeniden isteyip tekrar dene."
        );
      default:
        break;
    }

    if (error.code === "UNAUTHORIZED") {
      return translate(
        "auth.errors.unauthorized",
        "Bu işlem için doğrulama gerekiyor. Lütfen tekrar deneyin."
      );
    }
  }

  if (error instanceof Error && error.message) {
    switch (error.message) {
      case "Registration session missing":
        return translate(
          "auth.errors.registrationSessionExpired",
          "Kayıt oturumu geçersiz ya da süresi dolmuş. Lütfen telefon doğrulamasını yeniden başlat."
        );
      case "Password reset session missing":
        return translate(
          "auth.errors.passwordResetSessionExpired",
          "Şifre sıfırlama oturumu geçersiz ya da süresi dolmuş. Lütfen akışı yeniden başlat."
        );
      default:
        return error.message;
    }
  }

  return translate(fallbackKey, "Bir sorun oluştu. Lütfen tekrar dene.");
}
