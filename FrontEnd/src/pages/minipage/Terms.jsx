// src/pages/minipage/Terms.jsx
import React from 'react';
import logo from '../../components/logo.png';

// ---------------------------------------------------------------------
// Re-usable components (identical to Privacy.jsx)
// ---------------------------------------------------------------------
const Section = ({ title, children, className = '' }) => (
  <section className={`mb-12 ${className}`}>
    {/* CENTERED: Main title */}
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
      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
    ))}
  </ul>
);

// ---------------------------------------------------------------------
// Main Terms Page
// ---------------------------------------------------------------------
const Terms = () => {
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
                    className="text-sm lg:text-base text-gray-700 italic tracking-wide"
                    style={{
                      fontFamily: '"Great Vibes", "Brush Script MT", "Lucida Handwriting", cursive',
                      fontWeight: '500',
                      letterSpacing: '0.95px',
                      fontSize: '1.02rem',
                      lineHeight: '1.2',
                      textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      marginTop: '-2px',
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
          {/* ---------- TERMS AND CONDITIONS ---------- */}
          <Section title="Terms and Conditions of Service">
            {/* CENTERED: Subtitle + Intro */}
            <div className="text-center mb-8">
              <p className="font-bold text-xl mb-4">
                Terms and Conditions of Service for NRNHUB.NET, NRNHUB.XYZ, NRNHUB.COM.NP
              </p>
              <p>
                These Terms govern your access to and use of the Sites operated by <strong>NRNHUB</strong> (collectively, “we”, “us”, or “our”).
              </p>
            </div>

            <SubSection title="1. Acceptance of Terms">
              <p>
                <strong>1.1.</strong> By accessing or using the Sites (the “Sites”) operated by NRNHUB, you legally agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms or the Privacy Policy, do not use the Sites.
              </p>
              <p>
                <strong>1.2.</strong> These Terms apply to all visitors, registered users, contributors, commenters, subscribers, event participants, merchants, and any other individuals who access or use the Sites.
              </p>
            </SubSection>

            <SubSection title="2. Changes to Terms">
              <p>
                <strong>2.1.</strong> We may modify these Terms at any time. We will provide notice of material changes on the Sites and update the effective date. Your continued use of the Sites after such changes constitutes your acceptance of the revised Terms.
              </p>
            </SubSection>

            <SubSection title="3. Eligibility and Registration">
              <p>
                <strong>3.1. Eligibility:</strong> You must be at least 13 years old (or the minimum age required in your jurisdiction) to use the Sites. If you are accessing on behalf of an organization, you represent and warrant you have the authority to bind the organization.
              </p>
              <p>
                <strong>3.2. Account registration:</strong> Some features require an account. You must provide accurate information and update it as needed. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p>
                <strong>3.3. Prohibited uses:</strong> You agree not to misuse the Sites, including but not limited to unauthorized access, interference with operation, spamming, uploading malware, impersonation, or posting unlawful or harmful content.
              </p>
            </SubSection>

            <SubSection title="4. Content and Use Rights">
              <p>
                <strong>4.1. User-generated content (UGC):</strong> You may submit posts, comments, messages, or other content. By submitting UGC, you grant us a <strong>non-exclusive, worldwide, royalty-free, sublicensable license</strong> to use, reproduce, modify, adapt, publish, translate, distribute, and display the content in connection with the Site and our services, including promotional materials. You represent that you own or have rights to all content you submit and that it does not infringe third-party rights.
              </p>
              <p>
                <strong>4.2. Rights in third-party content:</strong> Any content provided by others remains the property of its owner. We may grant you limited rights to view or use third-party content as part of the Site’s features.
              </p>
              <p>
                <strong>4.3. Moderation and removal:</strong> We reserve the right to remove or modify UGC that violates these Terms, is inappropriate, or infringes rights, with or without notice.
              </p>
              <p>
                <strong>4.4. Intellectual property:</strong> All Site content, including text, images, logos, design, and code (excluding user-generated content you provide), is owned or licensed by NRNHUB and protected by applicable intellectual property laws. You may not use our marks or content without our prior written permission.
              </p>
            </SubSection>

            <SubSection title="5. Payments (When activated)">
              <p>
                <strong>5.1.</strong> When we introduce payments (e.g., memberships, donations, or paid access), you will be subject to separate terms and a payment processing policy. Payment processing will be conducted by a PCI-compliant processor.
              </p>
              <p>
                <strong>5.2. Payment data handling:</strong> We will not store sensitive payment information unless necessary for receipts or refunds, and you will be governed by the processor’s privacy and security policies.
              </p>
              <p>
                <strong>5.3. Refunds and cancellations:</strong> Refund policies, if any, will be described at the point of purchase. All refunds, if any, are at our discretion subject to applicable regulations and processor terms.
              </p>
              <p>
                <strong>5.4. Taxes:</strong> You are responsible for any applicable taxes related to payments.
              </p>
            </SubSection>

            <SubSection title="6. Privacy and Data Practices">
              <p>
                <strong>6.1.</strong> Our Privacy Policy explains how we collect, use, share, and protect your data. By using the Sites, you consent to our data practices as described therein.
              </p>
              <p>
                <strong>6.2.</strong> You acknowledge that any data you post publicly (e.g., in comments) may be visible to others and may be collected and used by others.
              </p>
            </SubSection>

            <SubSection title="7. Prohibited Conduct">
              <p>
                <strong>7.1.</strong> You may not engage in behavior that undermines the Sites’ integrity, including but not limited to:
              </p>
              <List
                items={[
                  'Introducing malware, ransomware, or harmful code.',
                  'Harassment, threats, or doxxing of individuals.',
                  'Unauthorized access, hacking, or attempting to bypass security measures.',
                  'Advertising or spamming other users without consent.',
                  'Violating any applicable law or third-party rights.',
                ]}
              />
            </SubSection>

            <SubSection title="8. Third-Party Content and Links">
              <p>
                <strong>8.1.</strong> The Sites may contain links to third-party sites or services. We are not responsible for their content, privacy practices, or reliability. Your use of third-party sites is at your own risk.
              </p>
            </SubSection>

            <SubSection title="9. Disclaimers and Limitation of Liability">
              <p>
                <strong>9.1.</strong> The Sites and all content are provided on an “as is” and “as available” basis without warranties of any kind, either express or implied.
              </p>
              <p>
                <strong>9.2.</strong> We do not warrant that the Sites will be uninterrupted, secure, or error-free, or that any defects will be corrected.
              </p>
              <p>
                <strong>9.3.</strong> To the maximum extent permitted by law, NRNHUB and its affiliates, officers, directors, employees, and agents shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the Sites or content.
              </p>
              <p>
                <strong>9.4.</strong> Notwithstanding the foregoing, nothing in these Terms excludes or limits liability for death or personal injury caused by its negligence, fraud, or any other liability that cannot be excluded or limited by law.
              </p>
            </SubSection>

            <SubSection title="10. Indemnification">
              <p>
                <strong>10.1.</strong> You agree to indemnify, defend, and hold harmless NRNHUB and its affiliates, officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, and expenses arising from your use of the Sites, your UGC, or your violation of these Terms.
              </p>
            </SubSection>

            <SubSection title="11. Termination and Suspension">
              <p>
                <strong>11.1.</strong> We may suspend or terminate your access to the Sites at our discretion for conduct that violates these Terms, infringes rights, or poses a risk to the Sites or users.
              </p>
              <p>
                <strong>11.2.</strong> Upon termination, your right to use the Sites ceases, and we may remove or disable access to your content.
              </p>
            </SubSection>

            <SubSection title="12. Modifications to the Sites">
              <p>
                <strong>12.1.</strong> We reserve the right to modify, suspend, or discontinue any part of the Sites at any time with or without notice.
              </p>
            </SubSection>

            <SubSection title="13. Governing Law and Jurisdiction">
              <p>
                <strong>13.1.</strong> These Terms and any disputes arising out of or related to them shall be governed by and construed in accordance with the laws of <strong>[Your Jurisdiction]</strong>. Any disputes shall be resolved in the courts of <strong>[Your Jurisdiction]</strong>, to the extent permitted by applicable law.
              </p>
              <p>
                <strong>13.2.</strong> If you are located outside <strong>[Your Jurisdiction]</strong>, you agree that the governing law will be <strong>[Your Jurisdiction]</strong>, and you consent to the exclusive personal jurisdiction of such courts for disputes.
              </p>
            </SubSection>

            <SubSection title="14. Arbitration (Alternative Dispute Resolution)">
              <p>
                <strong>14.1.</strong> For certain disputes, we may require arbitration in lieu of litigation. If arbitration applies, you will be bound by the applicable rules and procedures outlined in the arbitration agreement.
              </p>
            </SubSection>

            <SubSection title="15. Privacy Notices and Data Processing">
              <p>
                <strong>15.1.</strong> If you engage in paid services or store data with us, data handling will follow our Privacy Policy and any Data Processing Addendum (DPA) as applicable.
              </p>
            </SubSection>

            <SubSection title="16. Notifications and Contact Information">
              <p>
                <strong>16.1.</strong> If you have questions about these Terms, please contact us at:
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:infonrnhub@gmail.com" className="text-blue-600 underline">
                  infonrnhub@gmail.com
                </a>
              </p>
              <p>
                <strong>Support:</strong> Please use the Contact Us form
              </p>
            </SubSection>

            <SubSection title="17. Entire Agreement">
              <p>
                <strong>17.1.</strong> These Terms, together with our Privacy Policy and any applicable paid-service terms, constitute the entire agreement between you and NRNHUB regarding the Sites and supersede all prior or contemporaneous communications and proposals.
              </p>
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

export default Terms;