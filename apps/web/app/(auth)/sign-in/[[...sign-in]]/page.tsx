import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div id="clerk-captcha" />
      <SignIn />
    </div>
  );
}
