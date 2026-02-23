import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components"

interface DamageChargeProps {
  guestName: string
  bookingId: string
  checkIn: string
  checkOut: string
  chargeAmount: number
  description: string
}

export function DamageChargeEmail({
  guestName,
  bookingId,
  checkIn,
  checkOut,
  chargeAmount,
  description,
}: DamageChargeProps) {
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
      <Preview>Damage Charge — Comal River Casa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Damage Charge Notice</Heading>
          <Text style={text}>Hi {guestName},</Text>
          <Text style={text}>
            A damage charge has been applied to the card on file for your stay at{" "}
            <strong>Comal River Casa</strong>.
          </Text>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Booking Details
            </Heading>
            <Row>
              <Column>
                <Text style={label}>Confirmation #</Text>
                <Text style={value}>{bookingId}</Text>
              </Column>
            </Row>
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={label}>Check-in</Text>
                <Text style={value}>{formatDate(checkIn)}</Text>
              </Column>
              <Column>
                <Text style={label}>Check-out</Text>
                <Text style={value}>{formatDate(checkOut)}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Charge Details
            </Heading>
            <Row>
              <Column>
                <Text style={label}>Amount</Text>
                <Text style={amountText}>${chargeAmount.toFixed(2)}</Text>
              </Column>
            </Row>
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={label}>Description</Text>
                <Text style={cardText}>{description}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={text}>
            This charge has been applied to the card used for your original booking.
            If you have questions about this charge, please reply to this email.
          </Text>

          <Text style={footer}>
            Questions? Reply to this email or visit comalrivercasa.com.
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

const cardText = {
  color: "#444",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 4px",
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

const amountText = {
  color: "#dc2626",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 12px",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
}

const footer = {
  color: "#9ca3af",
  fontSize: "13px",
  padding: "0 40px",
  marginTop: "24px",
}
