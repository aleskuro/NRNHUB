// src/pages/minipage/Disclaimer.jsx
import React from 'react';
import logo from '../../components/logo.png';

// ---------------------------------------------------------------------
// Re-usable components (same as Privacy & Terms)
// ---------------------------------------------------------------------
const Section = ({ title, children, className = '' }) => (
  <section className={`mb-12 ${className}`}>
    {/* CENTERED: Main "Disclaimer" title */}
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
// Main Disclaimer Page
// ---------------------------------------------------------------------
const Disclaimer = () => {
  return (
    <>
      {/* ==== HERO / TITLE ==== */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {/* Left spacing */}
            <div className="hidden lg:block w-48 flex-shrink-0"></div>

            <div className="flex-grow text-center">

              {/* Logo + slogan */}
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
                Effective Date: <strong>15 MAY 2025</strong>
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
          {/* ---------- DISCLAIMER ---------- */}
          <Section title="Disclaimer">
            {/* CENTERED: Subtitle */}
            <p className="text-center font-bold text-xl mb-6">
              Disclaimer for NRNHUB Sites (NRNHUB.NET, NRNHUB.XYZ, NRNHUB.COM.NP)
            </p>

            <SubSection title="1. No Professional or Legal Advice">
              <List
                items={[
                  'The content on NRNHUB Sites is for <strong>general informational, educational, and informational purposes only</strong>. It does not constitute professional, legal, financial, medical, or other professional advice.',
                  'Reliance on any information provided on the Sites is at your own risk. We do not guarantee the accuracy, completeness, timeliness, or usefulness of any information.',
                ]}
              />
            </SubSection>

            <SubSection title="2. No Attorney-Client or Fiduciary Relationship">
              <p>
                Use of the Sites or communication with NRNHUB does not create an attorney-client, doctor-patient, or other fiduciary relationship. If you need professional advice, please consult a qualified professional in your jurisdiction.
              </p>
            </SubSection>

            <SubSection title="3. Content Accuracy and Changes">
              <p>
                We strive to keep content up to date, but we make no representations or warranties about the accuracy, reliability, or availability of any content.
              </p>
              <p>
                Content may be out of date, and we are under no obligation to update it. We may withdraw or modify content at any time without notice.
              </p>
            </SubSection>

            <SubSection title="4. External Links">
              <p>
                The Sites may contain links to third-party websites or resources. We do not endorse or assume responsibility for the accuracy, legality, or safety of any third-party sites.
              </p>
              <p>
                Visiting any linked site is at your own risk.
              </p>
            </SubSection>

            <SubSection title="5. User-Generated Content">
              <p>
                You may submit content (posts, comments, etc.). You are responsible for your UGC and for ensuring it complies with laws and these Terms.
              </p>
              <p>
                By submitting UGC, you grant NRNHUB the rights described in the Terms, including licenses to use, reproduce, modify, and display the content as part of the Sites and related services.
              </p>
            </SubSection>

            <SubSection title="6. No Warranty on Services">
              <p>
                The Sites and Services are provided <strong>“as is”</strong> and <strong>“as available”</strong> without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p>
                We do not guarantee uninterrupted access, security, or error-free operation of the Sites.
              </p>
            </SubSection>

            <SubSection title="7. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, NRNHUB and its officers, directors, employees, and agents are not liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with the use of the Sites or content.
              </p>
              <p>
                Some jurisdictions do not allow certain limitations of liability. If applicable law restricts the foregoing, our liability shall be limited to the maximum extent permitted by law.
              </p>
            </SubSection>

            <SubSection title="8. Personal Data and Privacy">
              <p>
                Our Privacy Policy describes how we collect and use data. By using the Sites, you acknowledge and consent to our data practices as set out in the Privacy Policy.
              </p>
              <p>
                Any concerns about data collection, cookies, or tracking should be addressed through the Privacy Policy and appropriate privacy controls.
              </p>
            </SubSection>

            <SubSection title="9. Intellectual Property">
              <p>
                All marks, logos, and copyrighted content on the Sites are owned by NRNHUB or its licensors. Use of our IP without permission is prohibited.
              </p>
              <p>
                Nothing in this Disclaimer grants you rights beyond those in the Terms of Service and Privacy Policy.
              </p>
            </SubSection>

            <SubSection title="10. Indemnification">
              <p>
                You agree to indemnify and hold harmless NRNHUB and its affiliates from and against claims arising from your misuse of the Sites, your UGC, or your violation of these disclaimers or Terms.
              </p>
            </SubSection>

            <SubSection title="11. Governing Law">
              <p>
                This Disclaimer and any disputes arising from it are governed by the same governing law as your Terms of Service and Privacy Policy, as applicable to NRNHUB’s global audience.
              </p>
            </SubSection>

            <SubSection title="12. Updates">
              <p>
                We may update this Disclaimer from time to time. When changes are material, we will post a notice on the Sites and update the effective date.
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

export default Disclaimer;