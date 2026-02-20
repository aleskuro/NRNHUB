// src/pages/minipage/Privacy.jsx
import React from 'react';
import logo from '../../components/logo.png';

// ---------------------------------------------------------------------
// Re-usable components
// ---------------------------------------------------------------------
const Section = ({ title, children, className = '' }) => (
  <section className={`mb-12 ${className}`}>
    {/* CENTERED: Main title "Privacy Policy" */}
    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{title}</h2>
    <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
  </section>
);

const SubSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="pl-4 space-y-2">{children}</div>
  </div>
);

const List = ({ items }) => (
  <ul className="list-disc pl-6 space-y-1">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

// ---------------------------------------------------------------------
// Main Privacy Page
// ---------------------------------------------------------------------
const Privacy = () => {
  return (
    <>
      {/* ==== HERO / TITLE ==== */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {/* Left spacing (matches About/Footer) */}
            <div className="hidden lg:block w-48 flex-shrink-0"></div>

            <div className="flex-grow text-center">

              {/* Logo + slogan (same as Footer) */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-4">
                  <img
                    src={logo}
                    alt="NRNHUB Logo"
                    className="h-12 lg:h-16 w-12 lg:w-16 object-contain"
                  />
                  <div className="flex flex-col justify-center">
                    <h3
                      className="text-3xl lg:text-4xl font-bold text-gray-800"
                      style={{ fontFamily: '"Baumans", sans-serif' }}
                    >
                      NRNHUB
                    </h3>
                    <p
                      className="text-sm lg:text-base text-gray-700 mt-1 italic tracking-wide"
                      style={{
                        fontFamily: '"Great Vibes", "Brush Script MT", "Lucida Handwriting", cursive',
                        fontWeight: '500',
                        letterSpacing: '0.3px',
                        lineHeight: '1.2',
                        textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      }}
                    >
                      From Routes to Roots
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Effective Date: <strong>May 15, 2025</strong>
              </p>
            </div>

            {/* Right spacing */}
            <div className="hidden lg:block w-48 flex-shrink-0"></div>
          </div>
        </div>
      </section>

      {/* ==== MAIN CONTENT ==== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* ---------- PRIVACY POLICY ---------- */}
          <Section title="Privacy Policy">
            {/* CENTERED: Welcome + Intro Paragraphs */}
            <div className="text-center mb-8">
              <p className="mb-4">
                <strong>Welcome to NRNHUB</strong>, which operates the blog sites
                <strong> WWW.NRNHUB.NET</strong>, <strong>WWW.NRNHUB.XYZ</strong>, and
                <strong> WWW.NRNHUB.COM.NP</strong> (collectively, the “Sites”). We provide
                editorial, informational, community-focused content related services (the
                “Services”).
              </p>
              <p>
                We respect your privacy and are committed to protecting your personal data.
                This Privacy Policy explains what data we collect, how we use it, with whom
                we share it, the choices you have, and the security measures we implement.
              </p>
            </div>

            <SubSection title="1. Scope">
              <p>
                This Policy applies to all visitors, registered users, contributors,
                commenters, subscribers, event participants, and any other individuals
                whose data we process through the Sites, regardless of your location.
              </p>
            </SubSection>

            <SubSection title="2. Data We Collect">
              <p>We may collect personal data you provide directly, data collected automatically, and data from third parties.</p>

              <SubSection title="2.1 Information you provide directly">
                <List
                  items={[
                    'Account information: name, email address, username, password (encrypted), profile photo, bio.',
                    'Contact and communications: messages or inquiries you send via contact forms, email, or site chat.',
                    'Content you submit: posts, comments, responses, messages, or any user-generated content (UGC) you publish on the Site.',
                    'Preferences: language, topics of interest, notification preferences.',
                    'Payment information (when/if you choose to pay): name on card, card number, expiration date, CVV, billing address (to be processed by PCI-compliant processors if/when payments are introduced).',
                  ]}
                />
              </SubSection>

              <SubSection title="2.2 Information automatically collected">
                <List
                  items={[
                    'Technical data: IP address, browser type/version, operating system, referral source, pages viewed, time/date of visit, time zone, duration of visit, clickstream data.',
                    'Device data: device type, unique device identifiers (where applicable), mobile advertising identifiers (where applicable).',
                    'Usage data: pages visited, features used, errors encountered, search terms, interaction data (likes, bookmarks, shares).',
                  ]}
                />
              </SubSection>

              <SubSection title="2.3 Information from third parties">
                <List
                  items={[
                    'Social media or authentication providers (if you sign in with a social account): basic profile information (as permitted by you and the provider).',
                    'Analytics and advertising partners: aggregated or pseudonymous data about your interactions with the Site.',
                    'Payment processors (when payments are enabled): transaction details and statuses necessary to process payments and provide receipts.',
                  ]}
                />
              </SubSection>
            </SubSection>

            <SubSection title="3. How We Use Your Data">
              <List
                items={[
                  'Provide and improve the Service – operate, maintain, enhance the Sites and Services; personalize content and recommendations.',
                  'Communication – respond to questions, comments, support requests; send administrative notices, updates, newsletters, marketing communications (with opt-out).',
                  'Community and safety – moderate content, enforce Terms of Service, detect and prevent fraud, abuse, security threats.',
                  'Analytics and performance – analyze trends, measure engagement, generate aggregated statistics.',
                  'Payments and billing (when activated) – process payments, manage subscriptions, issue receipts, handle refunds, prevent fraud.',
                  'Compliance and legal – comply with legal obligations and protect our rights.',
                ]}
              />
            </SubSection>

            <SubSection title="4. Legal Bases (for EU/EEA visitors)">
              <List
                items={[
                  'Consent: where you have given explicit permission (e.g., for marketing cookies).',
                  'Contractual necessity: to provide the Services.',
                  'Legitimate interests: to maintain and improve the Site and ensure security, balanced against your rights.',
                  'Legal obligation: to comply with applicable law.',
                ]}
              />
            </SubSection>

            <SubSection title="5. How We Share Your Data">
              <List
                items={[
                  'Service providers – hosting, analytics, email newsletters, security, moderation, payment processing (contractually obligated to protect data).',
                  'Public-facing content – UGC such as posts and comments may be visible to the public.',
                  'Compliance and safety – disclosure if required by law or to protect rights.',
                  'Corporate transactions – data may be transferred in a merger/acquisition with notice and protections.',
                  'International transfers – safeguarded by data transfer agreements or adequacy decisions.',
                ]}
              />
            </SubSection>

            <SubSection title="6. Your Rights and Choices">
              <List
                items={[
                  'Access and update – via account settings or by contacting us.',
                  'Deletion – request removal of account and data (subject to legal obligations).',
                  'Portability – request a copy of your data in a machine-readable format.',
                  'Withdrawal of consent – anytime, without affecting prior processing.',
                  'Objections and processing limitations – in certain circumstances.',
                  'Marketing communications – opt-out via unsubscribe link or account settings.',
                  'Do Not Track – honored where implemented.',
                ]}
              />
            </SubSection>

            <SubSection title="7. Data Retention">
              <p>
                We retain personal data for as long as necessary to fulfill the purposes described
                unless a longer retention period is required or permitted by law. Secure deletion
                or anonymization is applied when data is no longer needed.
              </p>
            </SubSection>

            <SubSection title="8. Security Measures">
              <List
                items={[
                  'Encryption for data in transit (TLS 1.2+) and at rest where feasible.',
                  'Access controls, authentication, least-privilege principles.',
                  'Regular security assessments, vulnerability scanning, incident response planning.',
                  'Privacy-by-design integrated into product development.',
                  'Data breach notification to users and authorities as required.',
                ]}
              />
            </SubSection>

            <SubSection title="9. Cookies and Tracking Technologies">
              <p>
                We use cookies and similar technologies to operate, analyze, and tailor the Site.
                You can manage preferences via your browser or our cookie consent banner.
                Analytics and ad partners may set cookies and track activity across sites.
                Do Not Track signals are treated in accordance with this Policy.
              </p>
            </SubSection>

            <SubSection title="10. Third-Party Links and Services">
              <p>
                The Site may contain links to third-party sites. We are not responsible for their
                privacy practices. Your use of third-party sites is at your own risk.
              </p>
            </SubSection>

            <SubSection title="11. Children’s Privacy">
              <p>
                The Sites are not intended for children under the age of 13 (or applicable age
                threshold). We do not knowingly collect personal data from children. If you
                become aware of such data, please contact us to remove it.
              </p>
            </SubSection>

            <SubSection title="12. International Visitors">
              <p>
                Our globally accessible Sites may process data in various jurisdictions.
                If you are in a region with specific data protection laws (e.g., GDPR),
                your rights under those laws may apply.
              </p>
            </SubSection>

            <SubSection title="13. Supervisory Authorities and Compliance">
              <p>
                We strive to comply with GDPR, CCPA/CPRA, and other local regulations.
                You may contact the appropriate supervisory authority with complaints.
              </p>
            </SubSection>

            <SubSection title="14. How to Contact Us">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:infonrnhub@gmail.com" className="text-blue-600 underline">
                  infonrnhub@gmail.com
                </a>
              </p>
            </SubSection>

            <SubSection title="15. Changes to this Privacy Policy">
              <p>
                We may update this Policy from time to time. Material changes will be
                announced on the Site and the effective date updated. Continued use
                constitutes acceptance of the updated Policy.
              </p>
            </SubSection>

            <SubSection title="Appendix A. Data Processing Addendum (DPA) and Security Details">
              <List
                items={[
                  'Data processing roles: We act as a data controller for data you provide directly and as a data processor for UGC.',
                  'Data flow overview: Collected via forms/site activity, stored on hosting infrastructure, processed by analytics/email tools.',
                  'Technical measures: TLS 1.2+, AES-256 at rest, access controls, audit logs, vulnerability management.',
                  'Retention specifics: Per internal policy and legal requirements.',
                  'Sub-processors: Hosting, analytics, email, moderation tools, payment processors (list available upon request).',
                ]}
              />
            </SubSection>
          </Section>

          {/* Back to top / contact */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Questions? Reach us at{' '}
              <a href="mailto:infonrnhub@gmail.com" className="text-blue-600 underline">
                infonrnhub@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Privacy;