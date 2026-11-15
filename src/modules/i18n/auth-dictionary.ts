/**
 * Domain dictionary entries for authentication, onboarding roles, one-time recovery,
 * and NDPA 2023 privacy notices (spread into BASE_TRANSLATIONS).
 */
export const AUTH_AND_PRIVACY_TRANSLATIONS = {
  "auth.registerPageTitle": {
    namespace: "auth",
    description: "Heading on the public user registration page",
    defaultText: "Create your Tongric account",
  },
  "auth.registerPageSubtitle": {
    namespace: "auth",
    description: "Subtitle explaining phone-first signup on the registration page",
    defaultText:
      "Register with your Nigerian phone number to trade produce, coordinate transport, or join the Benue pilot.",
  },
  "auth.roleSectionLabel": {
    namespace: "auth",
    description: "Label for choosing account role during signup",
    defaultText: "Choose how you will use Tongric",
  },
  "auth.roleFarmerTitle": {
    namespace: "auth",
    description: "Farmer role option title",
    defaultText: "Farmer",
  },
  "auth.roleFarmerDesc": {
    namespace: "auth",
    description: "Farmer role option description",
    defaultText: "List harvests, manage orders, and also browse inputs in Buyer view.",
  },
  "auth.roleBuyerTitle": {
    namespace: "auth",
    description: "Buyer role option title",
    defaultText: "Buyer",
  },
  "auth.roleBuyerDesc": {
    namespace: "auth",
    description: "Buyer role option description",
    defaultText: "Discover farmers, make cash or barter offers, and track deliveries.",
  },
  "auth.roleTransporterTitle": {
    namespace: "auth",
    description: "Transport Provider role option title",
    defaultText: "Transport Provider",
  },
  "auth.roleTransporterDesc": {
    namespace: "auth",
    description: "Transport Provider role option description",
    defaultText: "Accept farm-to-market delivery requests across Benue LGAs.",
  },
  "auth.fullNameLabel": {
    namespace: "auth",
    description: "Full name field label",
    defaultText: "Full name",
  },
  "auth.fullNamePlaceholder": {
    namespace: "auth",
    description: "Full name input placeholder",
    defaultText: "e.g. Aondona Tersoo",
  },
  "auth.phoneLabel": {
    namespace: "auth",
    description: "Nigerian phone number label",
    defaultText: "Nigerian phone number",
  },
  "auth.phonePlaceholder": {
    namespace: "auth",
    description: "Phone number placeholder",
    defaultText: "e.g. 0803 123 4567",
  },
  "auth.phoneHint": {
    namespace: "auth",
    description: "Helper text explaining Nigerian phone number normalization",
    defaultText: "Enter 080..., 070..., 081..., 090..., or +234... (used as your login ID).",
  },
  "auth.emailLabel": {
    namespace: "auth",
    description: "Optional email address label",
    defaultText: "Email address (optional)",
  },
  "auth.emailPlaceholder": {
    namespace: "auth",
    description: "Optional email placeholder",
    defaultText: "you@example.com (leave blank if you do not use email)",
  },
  "auth.emailHint": {
    namespace: "auth",
    description: "Helper text stating email is optional",
    defaultText: "Not required. Leave blank if you only use a phone number.",
  },
  "auth.languageLabel": {
    namespace: "auth",
    description: "Preferred language selector label at signup",
    defaultText: "Preferred language",
  },
  "auth.passwordLabel": {
    namespace: "auth",
    description: "Password input label",
    defaultText: "Create password",
  },
  "auth.passwordHint": {
    namespace: "auth",
    description: "Password rules helper text",
    defaultText: "Minimum 8 characters (letters or numbers easy for you to remember).",
  },
  "auth.confirmPasswordLabel": {
    namespace: "auth",
    description: "Confirm password input label",
    defaultText: "Confirm password",
  },
  "auth.showPassword": {
    namespace: "auth",
    description: "Toggle button label to reveal password",
    defaultText: "Show",
  },
  "auth.hidePassword": {
    namespace: "auth",
    description: "Toggle button label to hide password",
    defaultText: "Hide",
  },
  "auth.ndpaConsentTitle": {
    namespace: "auth",
    description: "Section title for NDPA consent block on registration",
    defaultText: "Privacy & Data Consent (NDPA 2023)",
  },
  "auth.ndpaRequiredLabel": {
    namespace: "auth",
    description: "Mandatory consent checkbox label",
    defaultText: "I agree to the Tongric Terms and NDPA 2023 Privacy Notice ({{version}}).",
  },
  "auth.ndpaRequiredHint": {
    namespace: "auth",
    description: "Helper note under mandatory NDPA checkbox",
    defaultText:
      "Required so Tongric can create your account, verify listings, and coordinate orders.",
  },
  "auth.ndpaOptionalLabel": {
    namespace: "auth",
    description: "Optional updates consent checkbox label",
    defaultText:
      "Optional: Send me helpful market price alerts and cooperative training updates.",
  },
  "auth.readPrivacyLink": {
    namespace: "auth",
    description: "Link text to open the full NDPA privacy notice page",
    defaultText: "Read full Privacy Notice",
  },
  "auth.submitRegister": {
    namespace: "auth",
    description: "Submit button label on registration form",
    defaultText: "Create account",
  },
  "auth.submittingRegister": {
    namespace: "auth",
    description: "Loading label while creating account",
    defaultText: "Creating your account...",
  },
  "auth.registerErrorTitle": {
    namespace: "auth",
    description: "Alert title when registration API fails",
    defaultText: "Could not complete registration",
  },
  "auth.recoveryCardTitle": {
    namespace: "auth",
    description: "Heading on the one-time recovery code screen after signup",
    defaultText: "Save your one-time recovery code",
  },
  "auth.recoveryCardSubtitle": {
    namespace: "auth",
    description: "Explanation under recovery code heading",
    defaultText:
      "Your account ({{phone}}) is ready! Write down this recovery code in a safe notebook. It is shown only once.",
  },
  "auth.recoveryWarningTitle": {
    namespace: "auth",
    description: "Warning callout title for saving recovery code",
    defaultText: "Keep this code private and offline",
  },
  "auth.recoveryWarningBody": {
    namespace: "auth",
    description: "Warning callout body explaining what the recovery code does",
    defaultText:
      "If you forget your password without an email address, this code or a verified Tongric admin can help you regain access.",
  },
  "auth.copyRecoveryCode": {
    namespace: "auth",
    description: "Button to copy the generated recovery code",
    defaultText: "Copy code",
  },
  "auth.copiedRecoveryCode": {
    namespace: "auth",
    description: "Button confirmation after copying recovery code",
    defaultText: "Copied",
  },
  "auth.recoveryAcknowledgeLabel": {
    namespace: "auth",
    description: "Checkbox confirming the user wrote down their recovery code",
    defaultText: "I have written down or safely stored my recovery code.",
  },
  "auth.continueHomeCta": {
    namespace: "auth",
    description: "Button to return home after acknowledging recovery code",
    defaultText: "Continue to Tongric",
  },
  "auth.dualViewTip": {
    namespace: "auth",
    description: "Note explaining Farmer/Buyer toggle complements account role",
    defaultText:
      "Tip: Farmers can switch between Farmer and Buyer views anytime using the header toggle.",
  },
  "privacy.pageTitle": {
    namespace: "privacy",
    description: "Heading for the NDPA 2023 privacy notice page",
    defaultText: "Tongric Privacy Notice (NDPA 2023)",
  },
  "privacy.policyVersionBadge": {
    namespace: "privacy",
    description: "Badge showing policy version",
    defaultText: "Policy version: {{version}}",
  },
  "privacy.pageIntro": {
    namespace: "privacy",
    description: "Plain-language introduction to how Tongric protects user data",
    defaultText:
      "Tongric follows Nigeria Data Protection Act (NDPA 2023) principles: data minimization, clear purpose, private document protection, and explicit consent.",
  },
  "privacy.sectionCollectTitle": {
    namespace: "privacy",
    description: "Section 1 heading on privacy notice",
    defaultText: "1. What information we collect",
  },
  "privacy.sectionCollectBody": {
    namespace: "privacy",
    description: "Section 1 body on privacy notice",
    defaultText:
      "We collect your name, Nigerian phone number, chosen account role, preferred language, and optional email address. Passwords and recovery codes are hashed and never stored in plain text.",
  },
  "privacy.sectionUseTitle": {
    namespace: "privacy",
    description: "Section 2 heading on privacy notice",
    defaultText: "2. Why we use your data",
  },
  "privacy.sectionUseBody": {
    namespace: "privacy",
    description: "Section 2 body on privacy notice",
    defaultText:
      "Your details let you publish produce listings, coordinate orders and delivery transport, and receive account support. Optional alerts are sent only if you opt in.",
  },
  "privacy.sectionProtectionTitle": {
    namespace: "privacy",
    description: "Section 3 heading on privacy notice",
    defaultText: "3. Security, storage & your rights",
  },
  "privacy.sectionProtectionBody": {
    namespace: "privacy",
    description: "Section 3 body on privacy notice",
    defaultText:
      "Verification IDs and private documents are stored privately with short-lived access links, never exposed in public marketplace feeds. Under NDPA 2023 you can request access, correction, or withdrawal of optional consent through Tongric support.",
  },
  "privacy.backToRegister": {
    namespace: "privacy",
    description: "Button linking back from privacy page to registration",
    defaultText: "Back to registration",
  },
  "auth.loginPageTitle": {
    namespace: "auth",
    description: "Heading on the login page",
    defaultText: "Log in to Tongric",
  },
  "auth.loginPageSubtitle": {
    namespace: "auth",
    description: "Subtitle on the login page",
    defaultText: "Enter your Nigerian phone number and password.",
  },
  "auth.submitLogin": {
    namespace: "auth",
    description: "Submit button on login form",
    defaultText: "Log in",
  },
  "auth.submittingLogin": {
    namespace: "auth",
    description: "Loading state while logging in",
    defaultText: "Logging in...",
  },
  "auth.loginErrorTitle": {
    namespace: "auth",
    description: "Alert heading when login fails",
    defaultText: "Could not log in",
  },
  "auth.forgotPasswordLink": {
    namespace: "auth",
    description: "Link to password recovery page",
    defaultText: "Forgot password?",
  },
  "auth.needAccountLink": {
    namespace: "auth",
    description: "Link from login to register page",
    defaultText: "Don't have an account? Register",
  },
  "auth.alreadyHaveAccountLink": {
    namespace: "auth",
    description: "Link from register to login page",
    defaultText: "Already have an account? Log in",
  },
  "auth.recoverPageTitle": {
    namespace: "auth",
    description: "Heading on the password reset page",
    defaultText: "Reset your password",
  },
  "auth.recoverPageSubtitle": {
    namespace: "auth",
    description: "Subtitle on the password reset page",
    defaultText: "Use the recovery code saved during registration.",
  },
  "auth.recoveryCodeLabel": {
    namespace: "auth",
    description: "Recovery code field label",
    defaultText: "Recovery code",
  },
  "auth.recoveryCodePlaceholder": {
    namespace: "auth",
    description: "Recovery code placeholder",
    defaultText: "e.g. TGR-XXXXX-XXXXX",
  },
  "auth.recoveryCodeHint": {
    namespace: "auth",
    description: "Helper text for recovery code input",
    defaultText: "Enter the 10-character code shown when you registered.",
  },
  "auth.newPasswordLabel": {
    namespace: "auth",
    description: "New password field label",
    defaultText: "New password",
  },
  "auth.confirmNewPasswordLabel": {
    namespace: "auth",
    description: "Confirm new password field label",
    defaultText: "Confirm new password",
  },
  "auth.submitRecover": {
    namespace: "auth",
    description: "Submit button on password reset form",
    defaultText: "Reset password",
  },
  "auth.submittingRecover": {
    namespace: "auth",
    description: "Loading state on password reset form",
    defaultText: "Resetting password...",
  },
  "auth.recoverSuccessTitle": {
    namespace: "auth",
    description: "Success message after password reset",
    defaultText: "Password reset successful",
  },
  "auth.recoverSuccessBody": {
    namespace: "auth",
    description: "Success guidance after password reset",
    defaultText: "Your password has been updated. You can now log in.",
  },
  "auth.goToLoginCta": {
    namespace: "auth",
    description: "Button to go to login page",
    defaultText: "Go to log in",
  },
  "auth.accountPageTitle": {
    namespace: "auth",
    description: "Heading on account overview page",
    defaultText: "Your Account",
  },
  "auth.accountPageSubtitle": {
    namespace: "auth",
    description: "Subtitle on account overview page",
    defaultText: "View your verified identity and role details.",
  },
  "auth.statusActive": {
    namespace: "auth",
    description: "Active account status badge",
    defaultText: "Active",
  },
  "auth.statusSuspended": {
    namespace: "auth",
    description: "Suspended account status badge",
    defaultText: "Suspended",
  },
  "auth.logoutButton": {
    namespace: "auth",
    description: "Log out button text",
    defaultText: "Log out",
  },
  "auth.loggingOut": {
    namespace: "auth",
    description: "Loading text while logging out",
    defaultText: "Logging out...",
  },
  "auth.notLoggedInTitle": {
    namespace: "auth",
    description: "Heading when viewing account without session",
    defaultText: "Sign in required",
  },
  "auth.notLoggedInBody": {
    namespace: "auth",
    description: "Guidance when viewing account without session",
    defaultText: "Please log in or create an account to view your profile.",
  },
  "auth.accessDeniedTitle": {
    namespace: "auth",
    description: "Heading when account role lacks permission",
    defaultText: "Access restricted",
  },
  "auth.accessDeniedBody": {
    namespace: "auth",
    description: "Guidance when account role lacks permission",
    defaultText: "You do not have permission to view this section with your current account role.",
  },
  "auth.assistedRegisterTitle": {
    namespace: "auth",
    description: "Heading for community agent assisted onboarding",
    defaultText: "Assisted Farmer Registration",
  },
  "auth.assistedRegisterSubtitle": {
    namespace: "auth",
    description: "Subtitle for assisted onboarding form",
    defaultText: "Register a farmer on their behalf with their consent.",
  },
  "auth.assistedByLabel": {
    namespace: "auth",
    description: "Label showing assisting operator on profile",
    defaultText: "Registered with help from {{operator}}",
  },
} as const;

