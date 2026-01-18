import { pool } from './index.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Jane's sarcastic descriptions for responsibilities
const janeWisdom = {
  "IT Leadership": "The person who gets blamed when WiFi is slow and praised when... actually, never praised.",
  "Vision and Strategy": "Turning 'we need better IT' into something that resembles a plan.",
  "Goal Setting": "OKRs, KPIs, and other acronyms that mean 'please measure if we're failing.'",
  "Innovation & Technology Planning": "Deciding which shiny new tool will become tomorrow's legacy system.",
  "Team & Culture Management": "Herding cats, but the cats have opinions about JavaScript frameworks.",
  "Governance & Standards": "Writing the rules everyone will claim they didn't know about.",
  "Security Management": "The art of saying 'no' professionally while everyone hates you.",
  "Financial Management": "Explaining why good IT costs money to people who think WiFi is free.",
  "Infrastructure Management": "Keeping the lights on, literally and figuratively.",
  "Network Infrastructure": "The plumbing nobody thinks about until it backs up.",
  "Cloud Infrastructure": "Other people's computers, now with monthly bills.",
  "User Support": "Turning 'it doesn't work' into actual diagnostic information.",
  "Help Desk Operations": "The front line. The heroes. The chronically underappreciated.",
};

const responsibilities = [
  // IT Leadership - Top Level
  {
    id: uuidv4(),
    title: "IT Leadership",
    description: "Strategic oversight and direction for all technology initiatives",
    why_it_matters: janeWisdom["IT Leadership"],
    typical_owner: "CTO, IT Director, or 'the person who seemed tech-savvy once'",
    category: "leadership",
    sort_order: 1,
    children: [
      {
        title: "Vision and Strategy",
        description: "Long-term technology direction aligned with business goals",
        why_it_matters: janeWisdom["Vision and Strategy"],
        typical_owner: "CTO/IT Director",
        category: "leadership",
        sort_order: 1,
        children: [
          {
            title: "Direction & Planning",
            description: "Create IT vision that supports business goals (IT/Business Alignment)",
            why_it_matters: "Without direction, IT becomes an expensive hobby rather than a business enabler.",
            typical_owner: "IT Leadership",
            category: "leadership",
            sort_order: 1,
          },
          {
            title: "Goal Setting",
            description: "Set annual and quarterly targets with clear success measures (OKRs)",
            why_it_matters: janeWisdom["Goal Setting"],
            typical_owner: "IT Leadership",
            category: "leadership",
            sort_order: 2,
          },
          {
            title: "Innovation & Technology Planning",
            description: "Evaluate and adopt new technologies strategically",
            why_it_matters: janeWisdom["Innovation & Technology Planning"],
            typical_owner: "IT Leadership / R&D",
            category: "leadership",
            sort_order: 3,
            children: [
              {
                title: "New Tool Evaluation",
                description: "Collect and evaluate requests for new tools and systems",
                why_it_matters: "Every tool request is someone's solution to yesterday's problem. Evaluate wisely.",
                typical_owner: "IT Team",
                category: "leadership",
                sort_order: 1,
              },
              {
                title: "Proof of Concept Testing",
                description: "Test new tools in safe environment with clear success criteria",
                why_it_matters: "Better to fail in a sandbox than in production on a Monday morning.",
                typical_owner: "IT Team",
                category: "leadership",
                sort_order: 2,
              },
            ]
          },
          {
            title: "Priority Management",
            description: "Determine what gets done first when everything is 'urgent'",
            why_it_matters: "When everything is priority one, nothing is priority one. Someone has to be the adult.",
            typical_owner: "IT Leadership",
            category: "leadership",
            sort_order: 4,
          },
        ]
      },
      {
        title: "Team & Culture Management",
        description: "Building and maintaining the IT team",
        why_it_matters: janeWisdom["Team & Culture Management"],
        typical_owner: "IT Director / HR",
        category: "leadership",
        sort_order: 2,
        children: [
          {
            title: "Team Development",
            description: "IT staffing, skills gaps, training plans",
            why_it_matters: "Your team is only as good as their last training. When was that again?",
            typical_owner: "IT Leadership + HR",
            category: "leadership",
            sort_order: 1,
          },
          {
            title: "Succession Planning",
            description: "Ensuring knowledge transfer and backup coverage",
            why_it_matters: "What happens when your one IT person wins the lottery? (They will not come back.)",
            typical_owner: "IT Leadership",
            category: "leadership",
            sort_order: 2,
          },
          {
            title: "Cross-Department Coordination",
            description: "Working with HR, Finance, Legal, and Operations",
            why_it_matters: "IT touches everything. Playing nice with other departments isn't optional.",
            typical_owner: "IT Leadership",
            category: "leadership",
            sort_order: 3,
          },
        ]
      },
      {
        title: "Governance & Standards",
        description: "Policies, procedures, and compliance frameworks",
        why_it_matters: janeWisdom["Governance & Standards"],
        typical_owner: "IT Leadership / Compliance",
        category: "governance",
        sort_order: 3,
        children: [
          {
            title: "Company IT Policies",
            description: "Acceptable use, security, BYOD, remote work policies",
            why_it_matters: "The rules of engagement. Yes, people need them written down.",
            typical_owner: "IT Leadership",
            category: "governance",
            sort_order: 1,
            children: [
              {
                title: "Acceptable Use Policy",
                description: "How employees should use computers and internet",
                why_it_matters: "Because 'common sense' is shockingly uncommon.",
                typical_owner: "IT + HR",
                category: "governance",
                sort_order: 1,
              },
              {
                title: "Information Security Policy",
                description: "How to keep company information secure",
                why_it_matters: "Your data is your business. Literally.",
                typical_owner: "IT Security",
                category: "governance",
                sort_order: 2,
              },
              {
                title: "Password Policy",
                description: "Password requirements and management",
                why_it_matters: "'Password123' is not a password. It's a cry for help.",
                typical_owner: "IT Security",
                category: "governance",
                sort_order: 3,
              },
              {
                title: "Remote Work Policy",
                description: "Working from home IT guidelines",
                why_it_matters: "Home WiFi + work data = someone needs to think this through.",
                typical_owner: "IT + HR",
                category: "governance",
                sort_order: 4,
              },
              {
                title: "BYOD Policy",
                description: "Personal device usage at work",
                why_it_matters: "Your personal phone on company WiFi is everyone's business now.",
                typical_owner: "IT Security",
                category: "governance",
                sort_order: 5,
              },
            ]
          },
          {
            title: "Risk & Compliance Management",
            description: "Managing IT risks and regulatory compliance",
            why_it_matters: "Risks ignored today become incidents tomorrow. It's basically physics.",
            typical_owner: "IT + Legal/Compliance",
            category: "governance",
            sort_order: 2,
            children: [
              {
                title: "Risk Register",
                description: "Track and manage IT risks with owners and mitigation plans",
                why_it_matters: "If you don't write it down, it doesn't exist. Until it happens.",
                typical_owner: "IT Leadership",
                category: "governance",
                sort_order: 1,
              },
              {
                title: "Business Continuity Planning",
                description: "How to keep business running during problems",
                why_it_matters: "Hope is not a strategy. Neither is 'it probably won't happen.'",
                typical_owner: "IT + Operations",
                category: "governance",
                sort_order: 2,
              },
              {
                title: "Incident Response Plan",
                description: "Who does what when problems happen",
                why_it_matters: "Panic is contagious. A plan is the vaccine.",
                typical_owner: "IT Security",
                category: "governance",
                sort_order: 3,
              },
              {
                title: "Compliance Frameworks",
                description: "SOC 2, ISO 27001, HIPAA, PCI DSS as applicable",
                why_it_matters: "Compliance: expensive to achieve, more expensive to ignore.",
                typical_owner: "IT + Legal",
                category: "governance",
                industry_tags: ["healthcare", "financial"],
                sort_order: 4,
              },
            ]
          },
          {
            title: "Security Management",
            description: "Overall security posture and improvement roadmap",
            why_it_matters: janeWisdom["Security Management"],
            typical_owner: "IT Security / CISO",
            category: "security",
            sort_order: 3,
          },
        ]
      },
      {
        title: "Financial Management",
        description: "IT budget planning and vendor management",
        why_it_matters: janeWisdom["Financial Management"],
        typical_owner: "IT Director + Finance",
        category: "leadership",
        sort_order: 4,
        children: [
          {
            title: "IT Budget Planning",
            description: "Plan and track spending across all IT categories",
            why_it_matters: "Money doesn't grow on servers. Someone has to count it.",
            typical_owner: "IT Leadership + Finance",
            category: "leadership",
            sort_order: 1,
          },
          {
            title: "Vendor & Purchasing Management",
            description: "Vendor selection, contracts, and relationship management",
            why_it_matters: "Vendors are partners until invoice disputes. Manage accordingly.",
            typical_owner: "IT Leadership",
            category: "leadership",
            sort_order: 2,
          },
        ]
      },
    ]
  },
  // Infrastructure Management - Top Level
  {
    id: uuidv4(),
    title: "Infrastructure Management",
    description: "Hardware, network, and cloud infrastructure",
    why_it_matters: janeWisdom["Infrastructure Management"],
    typical_owner: "IT Operations / Infrastructure Team",
    category: "infrastructure",
    sort_order: 2,
    children: [
      {
        title: "Core Infrastructure",
        description: "Essential infrastructure components and management tools",
        why_it_matters: "The foundation everything else breaks on top of.",
        typical_owner: "IT Operations",
        category: "infrastructure",
        sort_order: 1,
        children: [
          {
            title: "IT Management Tools",
            description: "RMM, backup, antivirus, and MDM platforms",
            why_it_matters: "You can't manage what you can't see. These are your eyes.",
            typical_owner: "IT Operations",
            category: "infrastructure",
            sort_order: 1,
          },
          {
            title: "Endpoint Management",
            description: "Computers, laptops, mobile devices",
            why_it_matters: "Every endpoint is a potential entry point. For work and for trouble.",
            typical_owner: "IT Operations",
            category: "infrastructure",
            sort_order: 2,
            children: [
              {
                title: "Computer Management",
                description: "Patching, backups, antivirus, user accounts",
                why_it_matters: "Unpatched computers are basically open invitations.",
                typical_owner: "IT Operations",
                category: "infrastructure",
                sort_order: 1,
              },
              {
                title: "Mobile Device Management",
                description: "Phones and tablets via MDM",
                why_it_matters: "That phone has company email. And Candy Crush. Priorities.",
                typical_owner: "IT Operations",
                category: "infrastructure",
                sort_order: 2,
              },
            ]
          },
        ]
      },
      {
        title: "Network Infrastructure",
        description: "Firewalls, switches, WiFi, VPN, cabling",
        why_it_matters: janeWisdom["Network Infrastructure"],
        typical_owner: "Network Admin / IT Operations",
        category: "infrastructure",
        sort_order: 2,
        children: [
          {
            title: "Firewall Management",
            description: "Firewall configuration, monitoring, and maintenance",
            why_it_matters: "Your first line of defense. Treat it like one.",
            typical_owner: "IT Security / Network Admin",
            category: "infrastructure",
            sort_order: 1,
          },
          {
            title: "Network Equipment",
            description: "Routers, switches, access points",
            why_it_matters: "When network equipment fails, everyone becomes an expert on networking.",
            typical_owner: "Network Admin",
            category: "infrastructure",
            sort_order: 2,
          },
          {
            title: "Wireless Infrastructure",
            description: "WiFi planning, security, and management",
            why_it_matters: "WiFi expectations: instant, everywhere, perfect. Reality: physics.",
            typical_owner: "Network Admin",
            category: "infrastructure",
            sort_order: 3,
          },
          {
            title: "VPN & Remote Access",
            description: "Secure remote connectivity",
            why_it_matters: "Remote work is here to stay. So is the need to secure it.",
            typical_owner: "IT Security / Network Admin",
            category: "infrastructure",
            sort_order: 4,
          },
          {
            title: "ISP Management",
            description: "Internet service provider relationships and troubleshooting",
            why_it_matters: "When the internet is down, IT gets blamed. Even though it's the ISP. Every time.",
            typical_owner: "IT Operations",
            category: "infrastructure",
            sort_order: 5,
          },
        ]
      },
      {
        title: "Cloud Infrastructure",
        description: "Microsoft 365, AWS, Azure, SaaS applications",
        why_it_matters: janeWisdom["Cloud Infrastructure"],
        typical_owner: "Cloud Admin / IT Operations",
        category: "cloud",
        sort_order: 3,
        children: [
          {
            title: "Microsoft 365 Administration",
            description: "Exchange, SharePoint, OneDrive, Teams",
            why_it_matters: "Where your company actually lives now. Treat it accordingly.",
            typical_owner: "IT Operations",
            category: "cloud",
            sort_order: 1,
          },
          {
            title: "Cloud Platform Management",
            description: "AWS, Azure, GCP infrastructure",
            why_it_matters: "The cloud is just someone else's computer. But more complex.",
            typical_owner: "Cloud Admin",
            category: "cloud",
            sort_order: 2,
          },
          {
            title: "SaaS Application Management",
            description: "Third-party software-as-a-service tools",
            why_it_matters: "Every department has their favorite SaaS. IT gets to integrate them all.",
            typical_owner: "IT Operations",
            category: "cloud",
            sort_order: 3,
          },
        ]
      },
      {
        title: "Communication Infrastructure",
        description: "Phone systems, VOIP, mobile services",
        why_it_matters: "People still need to talk. Somehow IT owns the phones now.",
        typical_owner: "IT Operations / Telecom",
        category: "infrastructure",
        sort_order: 4,
        children: [
          {
            title: "VOIP & Phone Systems",
            description: "Business phone system management",
            why_it_matters: "VOIP: Voice Over IP. Also: Very Often Investigated Problems.",
            typical_owner: "IT Operations",
            category: "infrastructure",
            sort_order: 1,
          },
          {
            title: "Mobile Services",
            description: "Cellular provider management and mobile lines",
            why_it_matters: "Company phones. Company problems. Company bills.",
            typical_owner: "IT / Finance",
            category: "infrastructure",
            sort_order: 2,
          },
        ]
      },
    ]
  },
  // Security Operations - Top Level
  {
    id: uuidv4(),
    title: "Security Operations",
    description: "Day-to-day security monitoring and response",
    why_it_matters: "Security is everyone's job. But someone has to actually do it.",
    typical_owner: "IT Security / SOC",
    category: "security",
    sort_order: 3,
    children: [
      {
        title: "Security Monitoring",
        description: "Continuous monitoring for threats and anomalies",
        why_it_matters: "Threats don't keep business hours. Neither should your monitoring.",
        typical_owner: "IT Security / MDR Provider",
        category: "security",
        sort_order: 1,
      },
      {
        title: "Vulnerability Management",
        description: "Scanning, patching, and remediation",
        why_it_matters: "Known vulnerabilities are just problems waiting to become incidents.",
        typical_owner: "IT Security",
        category: "security",
        sort_order: 2,
      },
      {
        title: "Security Awareness Training",
        description: "Employee training on security best practices",
        why_it_matters: "Humans are the weakest link. Training helps. Sometimes.",
        typical_owner: "IT Security + HR",
        category: "security",
        sort_order: 3,
      },
      {
        title: "Incident Response",
        description: "Responding to and recovering from security incidents",
        why_it_matters: "It's not if, it's when. Be ready for when.",
        typical_owner: "IT Security",
        category: "security",
        sort_order: 4,
      },
    ]
  },
  // User Support - Top Level
  {
    id: uuidv4(),
    title: "User Management & Support",
    description: "End-user support and account management",
    why_it_matters: janeWisdom["User Support"],
    typical_owner: "Help Desk / IT Support",
    category: "support",
    sort_order: 4,
    children: [
      {
        title: "Account & Access Management",
        description: "User accounts, permissions, and authentication",
        why_it_matters: "The right people with the right access. Sounds simple. It's not.",
        typical_owner: "IT Operations",
        category: "support",
        sort_order: 1,
        children: [
          {
            title: "User Account Administration",
            description: "Creating, managing, and deactivating user accounts",
            why_it_matters: "Onboarding: Day 1 productivity. Offboarding: Don't get hacked by ex-employees.",
            typical_owner: "IT Operations",
            category: "support",
            sort_order: 1,
          },
          {
            title: "Password & MFA Management",
            description: "Password resets and multi-factor authentication",
            why_it_matters: "Password resets: 90% of help desk tickets. MFA: why the other 10% happen.",
            typical_owner: "Help Desk",
            category: "support",
            sort_order: 2,
          },
          {
            title: "Access Control",
            description: "Managing permissions across systems",
            why_it_matters: "Least privilege: give people only what they need. Even if they complain.",
            typical_owner: "IT Operations",
            category: "support",
            sort_order: 3,
          },
        ]
      },
      {
        title: "Help Desk Operations",
        description: "Day-to-day user support",
        why_it_matters: janeWisdom["Help Desk Operations"],
        typical_owner: "Help Desk Team",
        category: "support",
        sort_order: 2,
        children: [
          {
            title: "Ticket Triage & Prioritization",
            description: "Incoming request handling and routing",
            why_it_matters: "Not all problems are created equal. Some are just louder.",
            typical_owner: "Help Desk",
            category: "support",
            sort_order: 1,
          },
          {
            title: "Business Hours Support",
            description: "Phone and remote support during work hours",
            why_it_matters: "9-5 problems get 9-5 solutions. Usually.",
            typical_owner: "Help Desk",
            category: "support",
            sort_order: 2,
          },
          {
            title: "After-Hours Support",
            description: "Emergency support outside business hours",
            why_it_matters: "Emergencies don't check the calendar. Someone needs to answer.",
            typical_owner: "Help Desk / On-Call",
            category: "support",
            sort_order: 3,
          },
          {
            title: "On-Site Support",
            description: "Physical presence for hardware issues",
            why_it_matters: "Some things can't be fixed remotely. Like coffee spilled on keyboards.",
            typical_owner: "Desktop Support",
            category: "support",
            sort_order: 4,
          },
        ]
      },
      {
        title: "User Communication & Training",
        description: "Keeping users informed and educated",
        why_it_matters: "Informed users cause fewer problems. In theory.",
        typical_owner: "IT + Training",
        category: "support",
        sort_order: 3,
        children: [
          {
            title: "IT Communications",
            description: "Status updates, change notifications, newsletters",
            why_it_matters: "Tell people before you change things. Revolutionary concept.",
            typical_owner: "IT",
            category: "support",
            sort_order: 1,
          },
          {
            title: "User Training Programs",
            description: "Software training and security awareness",
            why_it_matters: "Trained users are empowered users. Mostly.",
            typical_owner: "IT + HR",
            category: "support",
            sort_order: 2,
          },
        ]
      },
    ]
  },
  // Data & Backup - Top Level
  {
    id: uuidv4(),
    title: "Data Management & Backup",
    description: "Protecting and managing company data",
    why_it_matters: "Your data is your business. Lose it and... well, hope you have backups.",
    typical_owner: "IT Operations",
    category: "data",
    sort_order: 5,
    children: [
      {
        title: "Backup & Recovery",
        description: "Data backup, testing, and disaster recovery",
        why_it_matters: "Backups are boring until you need them. Then they're priceless.",
        typical_owner: "IT Operations",
        category: "data",
        sort_order: 1,
        children: [
          {
            title: "Backup Management",
            description: "Configure and monitor backup systems",
            why_it_matters: "A backup that doesn't work is just a false sense of security.",
            typical_owner: "IT Operations",
            category: "data",
            sort_order: 1,
          },
          {
            title: "Restore Testing",
            description: "Regular testing that backups actually work",
            why_it_matters: "Schrödinger's backup: both working and not working until you test it.",
            typical_owner: "IT Operations",
            category: "data",
            sort_order: 2,
          },
          {
            title: "Disaster Recovery",
            description: "Plan and execute recovery from major incidents",
            why_it_matters: "When everything goes wrong, this is the plan that saves you.",
            typical_owner: "IT Operations",
            category: "data",
            sort_order: 3,
          },
        ]
      },
      {
        title: "Data Classification & Handling",
        description: "Knowing what data you have and how to protect it",
        why_it_matters: "Not all data is created equal. Treat sensitive data sensitively.",
        typical_owner: "IT Security + Compliance",
        category: "data",
        sort_order: 2,
      },
    ]
  },
  // Applications - Top Level
  {
    id: uuidv4(),
    title: "Application Management",
    description: "Line-of-business and core applications",
    why_it_matters: "The software people actually use to do their jobs. Kind of important.",
    typical_owner: "IT Operations / App Owners",
    category: "applications",
    sort_order: 6,
    children: [
      {
        title: "Core Business Applications",
        description: "ERP, CRM, and essential business software",
        why_it_matters: "The applications that keep the business running. No pressure.",
        typical_owner: "IT + Business Units",
        category: "applications",
        sort_order: 1,
      },
      {
        title: "Application Lifecycle",
        description: "Updates, patches, and version management",
        why_it_matters: "Old software has old problems. Update or accept the consequences.",
        typical_owner: "IT Operations",
        category: "applications",
        sort_order: 2,
      },
      {
        title: "Integration & Automation",
        description: "Connecting applications and automating workflows",
        why_it_matters: "Manual processes are just automation waiting to happen.",
        typical_owner: "IT / Development",
        category: "applications",
        sort_order: 3,
      },
    ]
  },
  // Projects - Top Level
  {
    id: uuidv4(),
    title: "IT Project Management",
    description: "Planning and executing IT initiatives",
    why_it_matters: "Projects: where good intentions meet reality. Someone has to manage that collision.",
    typical_owner: "IT Leadership / PMO",
    category: "projects",
    sort_order: 7,
    children: [
      {
        title: "Project Portfolio Management",
        description: "Managing the pipeline of IT projects",
        why_it_matters: "Every project competes for the same resources. Choose wisely.",
        typical_owner: "IT Leadership",
        category: "projects",
        sort_order: 1,
      },
      {
        title: "Project Execution",
        description: "Planning, coordinating, and delivering projects",
        why_it_matters: "A project without a plan is just expensive chaos.",
        typical_owner: "Project Manager",
        category: "projects",
        sort_order: 2,
      },
      {
        title: "Change Management",
        description: "Safely implementing changes to IT systems",
        why_it_matters: "Changes cause outages. Managed changes cause fewer outages.",
        typical_owner: "IT Operations / Change Board",
        category: "projects",
        sort_order: 3,
      },
    ]
  },
  // Asset Management - Top Level
  {
    id: uuidv4(),
    title: "Asset & Inventory Management",
    description: "Tracking and managing IT equipment",
    why_it_matters: "If you don't know what you have, you can't secure it, support it, or budget for it.",
    typical_owner: "IT Operations",
    category: "assets",
    sort_order: 8,
    children: [
      {
        title: "Hardware Inventory",
        description: "Tracking all IT equipment",
        why_it_matters: "That laptop someone 'borrowed' three years ago? Still on your inventory.",
        typical_owner: "IT Operations",
        category: "assets",
        sort_order: 1,
      },
      {
        title: "Software Licensing",
        description: "License tracking and compliance",
        why_it_matters: "Software audits are not fun. Especially when you fail them.",
        typical_owner: "IT Operations",
        category: "assets",
        sort_order: 2,
      },
      {
        title: "Equipment Procurement",
        description: "Purchasing and receiving new equipment",
        why_it_matters: "Buying tech: fun. Procurement processes: necessary evil.",
        typical_owner: "IT + Procurement",
        category: "assets",
        sort_order: 3,
      },
      {
        title: "Lifecycle Management",
        description: "Refresh planning and equipment disposal",
        why_it_matters: "All equipment dies. Plan for it or be surprised by it.",
        typical_owner: "IT Operations",
        category: "assets",
        sort_order: 4,
      },
    ]
  },
];

// Recursive function to insert responsibilities
const insertResponsibility = async (item, parentId = null) => {
  const id = item.id || uuidv4();
  
  await pool.query(`
    INSERT INTO responsibility_templates 
    (id, parent_id, title, description, why_it_matters, typical_owner, category, industry_tags, sort_order, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      why_it_matters = EXCLUDED.why_it_matters,
      typical_owner = EXCLUDED.typical_owner,
      category = EXCLUDED.category,
      industry_tags = EXCLUDED.industry_tags,
      sort_order = EXCLUDED.sort_order
  `, [
    id,
    parentId,
    item.title,
    item.description,
    item.why_it_matters,
    item.typical_owner,
    item.category,
    item.industry_tags || [],
    item.sort_order || 0
  ]);

  if (item.children) {
    for (const child of item.children) {
      await insertResponsibility(child, id);
    }
  }
};

const seed = async () => {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (optional - comment out to preserve data)
    // await pool.query('DELETE FROM responsibility_assignments');
    // await pool.query('DELETE FROM responsibility_templates');
    // await pool.query('DELETE FROM players');
    // await pool.query('DELETE FROM jane_conversations');
    // await pool.query('DELETE FROM game_sessions');
    // await pool.query('DELETE FROM clients');

    // Insert responsibility templates
    console.log('📝 Inserting responsibility templates...');
    for (const item of responsibilities) {
      await insertResponsibility(item);
    }

    // Create a demo client
    const demoClientId = uuidv4();
    await pool.query(`
      INSERT INTO clients (id, name, primary_color, secondary_color, config)
      VALUES ($1, 'Demo Company', '#FF6B35', '#1A1A2E', '{"demo": true}')
      ON CONFLICT DO NOTHING
    `, [demoClientId]);

    console.log('✅ Database seeded successfully!');
    console.log(`   Demo client ID: ${demoClientId}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

seed();
