import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

export async function requestFirebasePhoneVerification(
  phoneNumber: string
): Promise<FirebaseAuthTypes.ConfirmationResult> {
  return auth().signInWithPhoneNumber(phoneNumber);
}

export async function confirmFirebasePhoneVerification(params: {
  confirmationResult: FirebaseAuthTypes.ConfirmationResult;
  code: string;
}): Promise<{
  firebaseIdToken: string;
  phoneNumber: string | null;
}> {
  const credential = await params.confirmationResult.confirm(params.code);
  const firebaseIdToken = await credential.user.getIdToken(true);
  const verifiedPhoneNumber = credential.user.phoneNumber ?? null;

  await auth().signOut().catch(() => undefined);

  return {
    firebaseIdToken,
    phoneNumber: verifiedPhoneNumber
  };
}
