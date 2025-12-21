import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: December 21, 2024</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using the IPEORG MLBB Discord bot and associated services (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on IPEORG MLBB's Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Using automated tools to scrape, download, or extract data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials on IPEORG MLBB's Service are provided on an 'as is' basis. IPEORG MLBB makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Limitations</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall IPEORG MLBB or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on IPEORG MLBB's Service, even if IPEORG MLBB or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Accuracy of Materials</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials appearing on IPEORG MLBB's Service could include technical, typographical, or photographic errors. IPEORG MLBB does not warrant that any of the materials on its Service are accurate, complete, or current. IPEORG MLBB may make changes to the materials contained on its Service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Materials on the Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              IPEORG MLBB has not reviewed all of the sites linked to its Service and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by IPEORG MLBB of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              IPEORG MLBB may revise these terms of service for its Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use the Service in any way that violates any applicable law or regulation or infringes upon the rights of others. Specifically, you agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use the Service to verify accounts that do not belong to you</li>
              <li>Engage in any form of harassment, abuse, or threats</li>
              <li>Attempt to disrupt the normal functioning of the Service</li>
              <li>Use automated systems to interact with the Service without permission</li>
              <li>Distribute malware or harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">10. Verification Accuracy</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for ensuring the accuracy of your Mobile Legends Game ID and server information. We are not responsible for verification failures due to incorrect information provided by you. We verify accounts through moogold.com and cannot be held liable for inaccuracies in their data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">11. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to terminate or suspend your access to the Service at any time, without notice, for any reason, including but not limited to violation of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">12. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of these external sites. Your use of third-party websites is subject to their terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">13. Disclaimer of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, IPEORG MLBB will not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>Email: legal@ipeorg.com</li>
              <li>Discord: discord.gg/ipeorg</li>
              <li>GitHub: github.com/IPEORG/mlbb-bot</li>
            </ul>
          </section>
        </div>
      </motion.main>
    </div>
  );
}
