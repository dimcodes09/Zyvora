"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "000000000000-placeholder.apps.googleusercontent.com";

export default function GoogleAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
