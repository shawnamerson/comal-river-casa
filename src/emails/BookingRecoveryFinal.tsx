import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Row,
  Column,
  Section,
  Text,
  Preview,
} from "@react-email/components"

interface BookingRecoveryFinalProps {
  guestName: string
  checkIn: string
  checkOut: string
  numberOfNights: number
  numberOfGuests: number
}

export function BookingRecoveryFinalEmail({
  guestName,
  checkIn,
  checkOut,
  numberOfNights,
  numberOfGuests,
}: BookingRecoveryFinalProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const checkInDate = formatDate(checkIn)
  const checkOutDate = formatDate(checkOut)

  return (
    <Html>
      <Head />
      <Preview>Last chance to book your river getaway — Comal River Casa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Still Dreaming of the River?</Heading>
          <Text style={text}>Hi {guestName},</Text>
          <Text style={text}>
            A few days ago you were looking at booking a stay at{" "}
            <strong>Comal River Casa</strong>. We just checked and your dates
            are still open — but we can&apos;t guarantee they&apos;ll stay that
            way for long.
          </Text>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Your Selected Dates
            </Heading>
            <Row>
              <Column>
                <Text style={label}>Check-in</Text>
                <Text style={value}>{checkInDate}</Text>
              </Column>
              <Column>
                <Text style={label}>Check-out</Text>
                <Text style={value}>{checkOutDate}</Text>
              </Column>
            </Row>
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={label}>Nights</Text>
                <Text style={value}>{numberOfNights}</Text>
              </Column>
              <Column>
                <Text style={label}>Guests</Text>
                <Text style={value}>{numberOfGuests}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={text}>
            Comal River Casa is steps from the river with direct access to
            tubing, swimming, and everything New Braunfels has to offer.
            Don&apos;t let this one slip away.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://www.comalrivercasa.com">
              Book Before It&apos;s Gone
            </Button>
          </Section>

          <Text style={footer}>
            No longer interested? No worries — just ignore this email and we
            won&apos;t reach out again.
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

const label = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 4px",
}

const value = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 12px",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
}

const link = {
  color: "#2563eb",
  textDecoration: "underline",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 32px",
}

const footer = {
  color: "#9ca3af",
  fontSize: "13px",
  padding: "0 40px",
  marginTop: "24px",
}
