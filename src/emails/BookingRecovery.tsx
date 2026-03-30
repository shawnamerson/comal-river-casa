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

interface BookingRecoveryProps {
  guestName: string
  checkIn: string
  checkOut: string
  numberOfNights: number
  numberOfGuests: number
}

export function BookingRecoveryEmail({
  guestName,
  checkIn,
  checkOut,
  numberOfNights,
  numberOfGuests,
}: BookingRecoveryProps) {
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
      <Preview>Your dates are still available — Comal River Casa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Dates Are Still Available</Heading>
          <Text style={text}>Hi {guestName},</Text>
          <Text style={text}>
            We noticed you were looking at staying at{" "}
            <strong>Comal River Casa</strong> but didn&apos;t get a chance to
            finish booking. Good news — your dates are still open!
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
            Comal River Casa is one of the most popular spots on the river,
            and these dates tend to fill up quickly — especially during peak
            season. We&apos;d hate for you to miss out.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://www.comalrivercasa.com">
              Complete Your Booking
            </Button>
          </Section>

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
