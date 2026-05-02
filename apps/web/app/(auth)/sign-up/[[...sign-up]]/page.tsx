import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div id="clerk-captcha" />
      <SignUp />
    </div>
  );
}
