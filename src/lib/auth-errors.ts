import type { SiteLocale } from "./site";

type AuthErrorKey = "invalidCredentials" | "emailNotConfirmed" | "invalidEmail" | "weakPassword" | "accountExists" | "rateLimited" | "providerUnavailable" | "sessionExpired" | "samePassword" | "requestFailed";

const COPY: Record<SiteLocale, Record<AuthErrorKey, string>> = {
  fr: {
    invalidCredentials: "L’adresse e-mail ou le mot de passe est incorrect. Vérifiez-les puis réessayez.",
    emailNotConfirmed: "Confirmez votre adresse avec le lien reçu par e-mail, puis connectez-vous.",
    invalidEmail: "Vérifiez votre adresse e-mail : elle ne semble pas valide.",
    weakPassword: "Ce mot de passe est trop faible. Choisissez-en un plus long et moins courant.",
    accountExists: "Un compte existe déjà avec cette adresse. Connectez-vous ou utilisez « Mot de passe oublié ».",
    rateLimited: "Trop de tentatives rapprochées. Patientez quelques instants avant de réessayer.",
    providerUnavailable: "Cette méthode de connexion est indisponible. Essayez une autre méthode proposée.",
    sessionExpired: "Le lien ou la session a expiré. Recommencez la connexion ou demandez un nouveau lien.",
    samePassword: "Choisissez un mot de passe différent du précédent.",
    requestFailed: "Cette action n’a pas pu aboutir. Vérifiez votre connexion et réessayez dans un instant.",
  },
  en: {
    invalidCredentials: "The email address or password is incorrect. Check them and try again.",
    emailNotConfirmed: "Confirm your address using the email link, then sign in.",
    invalidEmail: "Check your email address: it does not appear to be valid.",
    weakPassword: "This password is too weak. Choose a longer, less common one.",
    accountExists: "An account already uses this address. Sign in or select “Forgot password”.",
    rateLimited: "Too many attempts in a short time. Wait a little before trying again.",
    providerUnavailable: "This sign-in method is unavailable. Try another method offered.",
    sessionExpired: "The link or session has expired. Sign in again or request a new link.",
    samePassword: "Choose a password different from your previous one.",
    requestFailed: "This action could not be completed. Check your connection and try again shortly.",
  },
  de: {
    invalidCredentials: "E-Mail-Adresse oder Passwort ist falsch. Prüfen Sie Ihre Eingaben und versuchen Sie es erneut.",
    emailNotConfirmed: "Bestätigen Sie Ihre Adresse über den Link in der E-Mail und melden Sie sich dann an.",
    invalidEmail: "Prüfen Sie Ihre E-Mail-Adresse: Sie scheint ungültig zu sein.",
    weakPassword: "Dieses Passwort ist zu schwach. Wählen Sie ein längeres, weniger gebräuchliches Passwort.",
    accountExists: "Für diese Adresse besteht bereits ein Konto. Melden Sie sich an oder wählen Sie «Passwort vergessen».",
    rateLimited: "Zu viele Versuche in kurzer Zeit. Warten Sie einen Moment und versuchen Sie es erneut.",
    providerUnavailable: "Diese Anmeldemethode ist nicht verfügbar. Versuchen Sie eine andere angebotene Methode.",
    sessionExpired: "Der Link oder die Sitzung ist abgelaufen. Melden Sie sich erneut an oder fordern Sie einen neuen Link an.",
    samePassword: "Wählen Sie ein anderes Passwort als Ihr bisheriges.",
    requestFailed: "Die Aktion konnte nicht abgeschlossen werden. Prüfen Sie Ihre Verbindung und versuchen Sie es gleich erneut.",
  },
  it: {
    invalidCredentials: "L’indirizzo e-mail o la password non è corretto. Controlla i dati e riprova.",
    emailNotConfirmed: "Conferma il tuo indirizzo tramite il link ricevuto via e-mail, poi accedi.",
    invalidEmail: "Controlla il tuo indirizzo e-mail: non sembra valido.",
    weakPassword: "Questa password è troppo debole. Scegline una più lunga e meno comune.",
    accountExists: "Esiste già un account con questo indirizzo. Accedi oppure scegli «Password dimenticata».",
    rateLimited: "Troppi tentativi ravvicinati. Attendi un momento prima di riprovare.",
    providerUnavailable: "Questo metodo di accesso non è disponibile. Prova un altro metodo proposto.",
    sessionExpired: "Il link o la sessione è scaduto. Accedi di nuovo o richiedi un nuovo link.",
    samePassword: "Scegli una password diversa dalla precedente.",
    requestFailed: "Non è stato possibile completare l’azione. Controlla la connessione e riprova tra poco.",
  },
};

/** Translate stable provider codes, never display an arbitrary server message. */
function authErrorKey(error: unknown): AuthErrorKey {
  if (!error || typeof error !== "object") return "requestFailed";
  const { code, status, message } = error as { code?: unknown; status?: unknown; message?: unknown };
  if (status === 429) return "rateLimited";
  switch (code) {
    case "invalid_credentials": case "user_not_found": return "invalidCredentials";
    case "email_not_confirmed": return "emailNotConfirmed";
    case "email_address_invalid": return "invalidEmail";
    case "weak_password": return "weakPassword";
    case "email_exists": case "user_already_exists": return "accountExists";
    case "over_request_rate_limit": case "over_email_send_rate_limit": return "rateLimited";
    case "provider_disabled": case "email_provider_disabled": case "oauth_provider_not_supported": return "providerUnavailable";
    case "session_expired": case "session_not_found": case "otp_expired": case "flow_state_expired": case "flow_state_not_found": case "reauthentication_needed": return "sessionExpired";
    case "same_password": return "samePassword";
  }
  // Compatibility with older Auth responses without an error code.
  if (!code && message === "Invalid login credentials") return "invalidCredentials";
  return "requestFailed";
}

export function authErrorMessage(error: unknown, locale: SiteLocale = "fr") {
  return COPY[locale][authErrorKey(error)];
}
