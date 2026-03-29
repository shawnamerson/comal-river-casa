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

interface CheckInReminderProps {
  guestName: string
  checkIn: string
  checkOut: string
  doorCode: string
}

export function CheckInReminderEmail({
  guestName,
  checkIn,
  checkOut,
  doorCode,
}: CheckInReminderProps) {
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
      <Preview>It's vacation time! — Comal River Casa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>It's Vacation Time!</Heading>
          <Text style={text}>Hi {guestName},</Text>
          <Text style={text}>
            It's vacation time and we're so excited to have you stay with us!
            Here's everything you need for a smooth and easy check-in:
          </Text>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Check-in Info
            </Heading>
            <Text style={label}>Check-in</Text>
            <Text style={value}>{formatDate(checkIn)}</Text>
            <Text style={label}>Check-out</Text>
            <Text style={value}>{formatDate(checkOut)}</Text>
            <Hr style={hr} />
            <Text style={label}>Check-in Time</Text>
            <Text style={value}>4:00 PM</Text>
            <Text style={text}>
              Excited and want an earlier check-in? Message us, a small fee
              applies.
            </Text>
            <Hr style={hr} />
            <Text style={label}>Address</Text>
            <Text style={value}>
              371 W Lincoln St, Unit B114, New Braunfels, TX 78130
            </Text>
            <Hr style={hr} />
            <Text style={label}>Door Code</Text>
            <Text style={value}>{doorCode}</Text>
            <Text style={text}>
              Pull the door in, type in the code, and hit the unlock symbol.
            </Text>
          </Section>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              WiFi Details
            </Heading>
            <Text style={label}>Network</Text>
            <Text style={value}>SpectrumSetup-F0</Text>
            <Text style={label}>Password</Text>
            <Text style={value}>quietsnake181</Text>
          </Section>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              Pool & Spa Time!
            </Heading>
            <Text style={text}>
              The pool is just to the right as you step outside.
              <br />
              The gate code is <strong>245</strong>.
            </Text>
          </Section>

          <Section style={card}>
            <Heading as="h2" style={h2}>
              A Few Important Things
            </Heading>
            <Text style={text}>
              <strong>Toiletries:</strong> We've got the basics covered, but you
              might want to bring extras if you're planning a longer stay.
            </Text>
            <Text style={text}>
              <strong>Local Tips & More:</strong> Check out our digital guidebook
              for all the best local recommendations (we know the good spots!)
            </Text>
            <Text style={text}>
              <Link
                href="https://www.comalrivercasa.com/guidebook"
                style={link}
              >
                View Guidebook
              </Link>
            </Text>
          </Section>

          <Text style={text}>
            We can't wait to host you! If you need anything at all, just reach
            out — we're happy to help!
          </Text>
          <Text style={text}>
            Wishing you safe travels and an amazing stay!
          </Text>
          <Text style={text}>
            And hey, if you have a great time, we'd love to earn your 5 star
            review!
          </Text>
          <Text style={text}>
            Enjoy!
            <br />
            Kody+Dahlia
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

const footer = {
  color: "#9ca3af",
  fontSize: "13px",
  padding: "0 40px",
  marginTop: "24px",
}
