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

interface CheckOutReminderProps {
  guestName: string
  checkOut: string
  reviewToken: string
}

export function CheckOutReminderEmail({
  guestName,
  checkOut,
  reviewToken,
}: CheckOutReminderProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <Html>
      <Head />
      <Preview>Checkout reminders — Comal River Casa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Checkout Reminders</Heading>
          <Text style={text}>Hi {guestName},</Text>
          <Text style={text}>
            We hope you enjoyed your stay! Before heading out on{" "}
            {formatDate(checkOut)}, please complete the following:
          </Text>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Checkout Checklist
            </Heading>
            <Text style={text}>
              &bull; Checkout is at <strong>11:00 AM</strong>
              <br /><br />
              &bull; Load and run the dishwasher
              <br /><br />
              &bull; Leave beds unmade in their place
              <br /><br />
              &bull; Place all used towels and blankets on the floor in front of washer and dryer
              <br /><br />
              &bull; Place all TV remotes back by their applicable TV
              <br /><br />
              &bull; Turn off all lights
              <br /><br />
              &bull; Set thermostat to 77&deg;
              <br /><br />
              &bull; Place all parking passes and wristbands on kitchen table. A replacement fee of <strong>$25 will be charged for each wristband not returned</strong>
              <br /><br />
              &bull; Close and lock all doors and windows
            </Text>
          </Section>

          <Text style={text}>
            If you enjoyed your stay, would you mind leaving us a{" "}
            <strong>5-star review</strong>, please? Your feedback makes all the
            difference for us as hosts.
          </Text>
          <Text style={{ ...text, textAlign: "center" as const }}>
            <Link
              href={`https://www.comalrivercasa.com/review?token=${reviewToken}`}
              style={button}
            >
              Leave a Review
            </Link>
          </Text>

          <Text style={text}>
            Safe travels and thank you for choosing our place to stay during
            your New Braunfels getaway!
          </Text>

          <Text style={footer}>
            Questions? Email us at{" "}
            <Link href="mailto:kodybyron@yahoo.com" style={link}>
              kodybyron@yahoo.com
            </Link>{" "}
            or visit comalrivercasa.com.
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

const h2 = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const text = {
  color: "#444",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px",
  padding: "0 40px",
}

const card = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  margin: "16px 40px",
  padding: "24px",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
}

const link = {
  color: "#2563eb",
  textDecoration: "underline",
}

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "12px 32px",
}

const footer = {
  color: "#9ca3af",
  fontSize: "13px",
  padding: "0 40px",
  marginTop: "24px",
}
