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

interface NewBookingNotificationProps {
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  bookingId: string
  checkIn: string
  checkOut: string
  numberOfNights: number
  numberOfGuests: number
  totalPrice: number
  taxTotal?: number | null
  specialRequests?: string | null
}

export function NewBookingNotificationEmail({
  guestName,
  guestEmail,
  guestPhone,
  bookingId,
  checkIn,
  checkOut,
  numberOfNights,
  numberOfGuests,
  totalPrice,
  taxTotal,
  specialRequests,
}: NewBookingNotificationProps) {
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
      <Preview>New Booking — {guestName} — {formatDate(checkIn)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Booking Received</Heading>
          <Text style={text}>
            A new booking has been confirmed and payment received.
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
            <Row>
              <Column>
                <Text style={label}>Guests</Text>
                <Text style={value}>{numberOfGuests}</Text>
              </Column>
              <Column>
                <Text style={label}>Nights</Text>
                <Text style={value}>{numberOfNights}</Text>
              </Column>
            </Row>
            {taxTotal != null && taxTotal > 0 && (
              <>
                <Hr style={hr} />
                <Row>
                  <Column>
                    <Text style={label}>Taxes</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={label}>${taxTotal.toFixed(2)}</Text>
                  </Column>
                </Row>
              </>
            )}
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={totalLabel}>Total Received</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={totalLabel}>${totalPrice.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          {specialRequests && (
            <Section style={card}>
              <Heading as="h2" style={h2}>Special Requests</Heading>
              <Text style={text}>{specialRequests}</Text>
            </Section>
          )}
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

const totalLabel = {
  color: "#111827",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
}
