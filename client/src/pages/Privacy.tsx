import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
        </div>
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 21, 2024</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              IPEORG MLBB ("we," "us," "our," or "Company") operates the Discord bot and web platform (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Discord Data</h3>
                <p className="text-muted-foreground">
                  When you authenticate with Discord OAuth2, we collect: Discord user ID, username, avatar, and email address. This data is used to identify you within our system and authenticate access to the admin dashboard.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Verification Data</h3>
                <p className="text-muted-foreground">
                  When you use the /verify command, we collect: Your Mobile Legends Game ID, selected server region, player name (retrieved from moogold.com), and verification timestamp. This information is stored to maintain verification records and prevent duplicate verification.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Server Data</h3>
                <p className="text-muted-foreground">
                  We collect information about the Discord servers where our bot is installed, including server ID, name, member count, and configured channels for verification and logging.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Usage Data</h3>
                <p className="text-muted-foreground">
                  We automatically collect information about your interactions with the Service, including command usage, verification attempts, errors, and timestamps. This helps us improve our service and troubleshoot issues.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To verify your Mobile Legends account and assign appropriate Discord roles</li>
              <li>To authenticate your access to the admin dashboard</li>
              <li>To maintain verification records and audit logs</li>
              <li>To improve our Service, troubleshoot issues, and prevent fraud</li>
              <li>To comply with legal obligations and Discord's Terms of Service</li>
              <li>To send you important notifications about your verification status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as necessary to provide the Service and comply with legal obligations. Verification records are retained for audit purposes. You can request deletion of your data by contacting us, except where we are required to retain it by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our Service uses third-party services that may collect information used to identify you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Discord</strong>: For authentication and bot functionality. See Discord's Privacy Policy for details.</li>
              <li><strong>moogold.com</strong>: For Mobile Legends account verification. See moogold's Privacy Policy for details.</li>
              <li><strong>Replit</strong>: For hosting our Service. See Replit's Privacy Policy for details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Right to Access</strong>: You can request access to your personal information</li>
              <li><strong>Right to Correction</strong>: You can request correction of inaccurate data</li>
              <li><strong>Right to Deletion</strong>: You can request deletion of your data (subject to legal obligations)</li>
              <li><strong>Right to Portability</strong>: You can request your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete such information and terminate the child's account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>Email: privacy@ipeorg.com</li>
              <li>Discord: discord.gg/ipeorg</li>
              <li>GitHub: github.com/IPEORG/mlbb-bot</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page. Your continued use of the Service after such modifications constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>
        </div>
      </motion.main>
    </div>
  );
}
