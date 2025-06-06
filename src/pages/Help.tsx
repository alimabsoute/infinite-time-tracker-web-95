
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          id: "signup",
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button on our homepage, enter your email address, and follow the verification steps. You can start using PhynxTimer immediately with our free plan."
        },
        {
          id: "first-timer",
          question: "How do I create my first timer?",
          answer: "After logging in, click the '+' button or 'Create Timer' to add a new timer. Give it a name, optionally set a deadline, and click 'Create'. You can then start tracking time immediately."
        }
      ]
    },
    {
      category: "Using Timers",
      questions: [
        {
          id: "start-stop",
          question: "How do I start and stop timers?",
          answer: "Click the play button to start a timer and the pause button to stop it. You can have multiple timers but only one can be active at a time."
        },
        {
          id: "edit-timer",
          question: "Can I edit a timer after creating it?",
          answer: "Yes! Click on any timer to open the edit dialog where you can change the name, deadline, category, and manually adjust the elapsed time."
        },
        {
          id: "multiple-timers",
          question: "Can I have multiple timers running?",
          answer: "Only one timer can be active at a time. When you start a new timer, any currently running timer will automatically pause."
        }
      ]
    },
    {
      category: "Analytics & Reports",
      questions: [
        {
          id: "view-analytics",
          question: "How do I view my time tracking analytics?",
          answer: "Go to the Dashboard where you'll see charts showing your daily activity, weekly trends, and productivity patterns. The Calendar view also provides detailed day-by-day breakdowns."
        },
        {
          id: "export-data",
          question: "Can I export my data?",
          answer: "Yes! You can export your timer data and analytics. This feature is available to Pro users and includes CSV export options for further analysis."
        }
      ]
    },
    {
      category: "Calendar Integration",
      questions: [
        {
          id: "calendar-view",
          question: "How does the calendar view work?",
          answer: "The Calendar view shows all your timers organized by date. You can see activity heatmaps, deadlines, and click on any date to view detailed time tracking for that day."
        },
        {
          id: "deadlines",
          question: "How do deadlines work?",
          answer: "Set deadlines when creating or editing timers. Deadlines appear in the calendar view and help you track progress toward your goals."
        }
      ]
    },
    {
      category: "Account & Billing",
      questions: [
        {
          id: "upgrade-account",
          question: "How do I upgrade to Pro?",
          answer: "Click on your profile menu and select 'Upgrade to Pro' or visit our pricing page. Pro includes unlimited timers, advanced analytics, and priority support."
        },
        {
          id: "cancel-subscription",
          question: "How do I cancel my subscription?",
          answer: "Go to your Profile settings and click 'Manage Subscription'. You can cancel anytime and your access will continue until the end of your billing period."
        },
        {
          id: "data-security",
          question: "Is my data secure?",
          answer: "Absolutely! We use industry-standard encryption and secure cloud infrastructure. Your data is backed up regularly and we never share it with third parties."
        }
      ]
    }
  ];

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and learn how to get the most out of PhynxTimer.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredFaq.map((category) => (
            <div key={category.category} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq) => (
                  <Collapsible key={faq.id}>
                    <CollapsibleTrigger
                      onClick={() => toggleSection(faq.id)}
                      className="flex items-center justify-between w-full text-left p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {openSections.includes(faq.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3 text-muted-foreground">
                      {faq.answer}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link to="/contact">
            <Button>
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Help;
