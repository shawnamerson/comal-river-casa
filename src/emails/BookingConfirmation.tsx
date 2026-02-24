import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components"
import { PROPERTY } from "@/config/property"

interface BookingConfirmationProps {
  guestName: string
  guestEmail: string
  bookingId: string
  checkIn: string
  checkOut: string
  numberOfNights: number
  numberOfGuests: number
  pricePerNight: number
  cleaningFee: number
  totalPrice: number
  specialRequests?: string | null
}

export function BookingConfirmationEmail({
  guestName,
  bookingId,
  checkIn,
  checkOut,
  numberOfNights,
  numberOfGuests,
  pricePerNight,
  cleaningFee,
  totalPrice,
  specialRequests,
}: BookingConfirmationProps) {
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
      <Preview>Booking Confirmed — Comal River Casa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed!</Heading>
          <Text style={text}>Hi {guestName},</Text>
          <Text style={text}>
            Your booking at <strong>Comal River Casa</strong> is confirmed and
            your payment has been received. We can&apos;t wait to host you!
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
          </Section>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Payment Summary
            </Heading>
            <Row>
              <Column>
                <Text style={label}>
                  ${pricePerNight}/night × {numberOfNights} nights
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={label}>${(pricePerNight * numberOfNights).toFixed(2)}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Cleaning fee</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={label}>${cleaningFee.toFixed(2)}</Text>
              </Column>
            </Row>
            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={totalLabel}>Total paid</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={totalLabel}>${totalPrice.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          {specialRequests && (
            <Section style={card}>
              <Heading as="h2" style={h2}>
                Special Requests
              </Heading>
              <Text style={text}>{specialRequests}</Text>
            </Section>
          )}

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Property Address
            </Heading>
            <Text style={text}>
              1750 Common St Unit 1108
              <br />
              New Braunfels, TX 78130
            </Text>
            <Text style={text}>
              Check-in is after {PROPERTY.checkInTime}. Check-out is by {PROPERTY.checkOutTime}.
            </Text>
          </Section>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Cancellation Policy
            </Heading>
            <Text style={text}>
              • Full refund if cancelled 5+ days before check-in
              <br />
              • 50% refund if cancelled within 5 days of check-in
            </Text>
            <Text style={text}>
              To cancel or manage your booking, visit{" "}
              <strong>comalrivercasa.com/manage-booking</strong> and enter your
              confirmation number and email address.
            </Text>
            <Text style={text}>
              View our full policies:{" "}
              <Link href="https://comalrivercasa.com/policies/cancellation" style={link}>
                Cancellation Policy
              </Link>
              {" | "}
              <Link href="https://comalrivercasa.com/policies/house-rules" style={link}>
                House Rules
              </Link>
              {" | "}
              <Link href="https://comalrivercasa.com/policies/terms" style={link}>
                Terms of Service
              </Link>
            </Text>
          </Section>

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

const link = {
  color: "#2563eb",
  textDecoration: "underline",
}

const footer = {
  color: "#9ca3af",
  fontSize: "13px",
  padding: "0 40px",
  marginTop: "24px",
}
