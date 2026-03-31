import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface PasswordResetProps {
  resetUrl: string
}

export function PasswordResetEmail({ resetUrl }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password — Comal River Casa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>
            We received a request to reset your password for your{" "}
            <strong>Comal River Casa</strong> admin account.
          </Text>
          <Text style={text}>
            Click the button below to set a new password. This link will expire
            in 1 hour.
          </Text>

          <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
            <Link href={resetUrl} style={button}>
              Reset Password
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            If you didn&apos;t request a password reset, you can safely ignore
            this email. Your password will not be changed.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "30px 0 20px",
  padding: "0 40px",
}

const text = {
  color: "#444",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px",
  padding: "0 40px",
}

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 32px",
  textDecoration: "none",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 40px",
}

const footer = {
  color: "#9ca3af",
  fontSize: "13px",
  padding: "0 40px",
  marginTop: "24px",
}
