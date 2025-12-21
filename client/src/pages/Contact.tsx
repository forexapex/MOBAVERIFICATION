import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Mail, MessageCircle, Github, Globe, ExternalLink, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Discord Community",
      description: "Join our Discord server for real-time support and community discussion",
      action: "Join Discord",
      link: "https://discord.gg/ipeorg",
      color: "indigo"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email for detailed inquiries or business proposals",
      action: "Send Email",
      link: "mailto:support@ipeorg.com",
      color: "blue"
    },
    {
      icon: Github,
      title: "GitHub Issues",
      description: "Report bugs or request features on our GitHub repository",
      action: "Open Issues",
      link: "https://github.com/IPEORG/mlbb-bot",
      color: "slate"
    },
    {
      icon: Globe,
      title: "Website",
      description: "Visit our main website for more information about IPEORG",
      action: "Visit Website",
      link: "https://ipeorg.com",
      color: "purple"
    }
  ];

  const faqs = [
    {
      question: "How long does verification take?",
      answer: "Verification is instant! Once you provide your Game ID and Server, our system validates your Mobile Legends account through moogold.com and assigns the verified role immediately."
    },
    {
      question: "What if my Game ID is incorrect?",
      answer: "If your Game ID is invalid, you'll receive an error message. Double-check your Mobile Legends Game ID (usually 9-10 digits) and try again. Make sure you're using the correct server region."
    },
    {
      question: "Can I verify multiple accounts?",
      answer: "Currently, you can have one verified account per Discord user. If you need to change your verified account, contact an admin in our Discord server."
    },
    {
      question: "Is my data safe?",
      answer: "Yes! We use Discord OAuth2 for secure authentication and only store essential verification data. Check our Privacy Policy for complete details on data handling."
    },
    {
      question: "How do I report a bug?",
      answer: "You can report bugs through our GitHub Issues page, Discord server, or email support@ipeorg.com with detailed information about the issue."
    },
    {
      question: "What servers are supported?",
      answer: "We support SEA, GLOBAL, AMERICAS, and EUROPE server regions for Mobile Legends verification."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Contact & Support</h1>
          <div className="w-32" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? Want to partner with IPEORG? Need support? We're here to help!
          </p>
        </motion.div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {contactMethods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-8 hover-elevate h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-lg bg-${method.color}-500/20 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${method.color}-500`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">{method.description}</p>
                  <a href={method.link} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="default">
                      {method.action}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find answers to common questions about verification and our service</p>
          </div>

          <div className="grid gap-6">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 p-12 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Didn't find your answer?</h2>
          <p className="text-muted-foreground mb-6">Join our Discord community or send us an email for personalized support</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://discord.gg/ipeorg" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-xl">
                Join Discord <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="mailto:support@ipeorg.com">
              <Button size="lg" variant="outline" className="rounded-xl">
                Email Support <Mail className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
