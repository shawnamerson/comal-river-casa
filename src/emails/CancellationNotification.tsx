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

interface CancellationNotificationProps {
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  bookingId: string
  checkIn: string
  checkOut: string
  totalPrice: number
  refundAmount?: number | null
  cancellationReason?: string | null
  cancelledBy: "guest" | "admin"
}

export function CancellationNotificationEmail({
  guestName,
  guestEmail,
  guestPhone,
  bookingId,
  checkIn,
  checkOut,
  totalPrice,
  refundAmount,
  cancellationReason,
  cancelledBy,
}: CancellationNotificationProps) {
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
      <Preview>Booking Cancelled — {guestName} — {formatDate(checkIn)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Cancelled</Heading>
          <Text style={text}>
            A booking has been cancelled by the <strong>{cancelledBy === "admin" ? "property owner" : "guest"}</strong>.
          </Text>

          <Section style={card}>
            <Heading as="h2" style={h2}>Guest Info</Heading>
            <Row>
              <Column>
                <Text style={label}>Name</Text>
                <Text style={value}>{guestName}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Email</Text>
                <Text style={value}>{guestEmail}</Text>
              </Column>
            </Row>
            {guestPhone && (
              <Row>
                <Column>
                  <Text style={label}>Phone</Text>
                  <Text style={value}>{guestPhone}</Text>
                </Column>
              </Row>
            )}
          </Section>

          <Section style={card}>
            <Heading as="h2" style={h2}>Booking Details</Heading>
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
            {cancellationReason && (
              <Row>
                <Column>
                  <Text style={label}>Reason</Text>
                  <Text style={value}>{cancellationReason}</Text>
                </Column>
              </Row>
            )}
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={label}>Total Charged</Text>
                <Text style={value}>${totalPrice.toFixed(2)}</Text>
              </Column>
              <Column>
                <Text style={label}>Refund Issued</Text>
                <Text style={value}>
                  {refundAmount ? `$${refundAmount.toFixed(2)}` : "None"}
                </Text>
              </Column>
            </Row>
          </Section>
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
