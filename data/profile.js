// ============================================================
// PROFILE DATA
// Edit this file to update all personal information across the
// entire site — terminal, settings window, and desktop.
// ============================================================

var PROFILE = {

  // ----------------------------------------------------------
  // Site & Branding
  // ----------------------------------------------------------
  site: {
    title: "Abdul's Shellfolio",
    domain: "linuxy.us"
  },

  // ----------------------------------------------------------
  // Terminal Settings
  // These control the fake terminal prompt, hostname, and the
  // title bar text.  Change promptUser / promptHost to update
  // what the terminal prompt looks like.
  // ----------------------------------------------------------
  terminal: {
    promptUser: "abdul",
    promptHost: "linuxy.us",
    hostname: "ubuntu-server"          // shown in neofetch, uname, syslog, exit, etc.
  },

  // ----------------------------------------------------------
  // About / Bio
  // ----------------------------------------------------------
  about: {
    name: "Abdul Noushad Sheikh",
    headline: "Welcome to my website!",
    profileImage: "assets/images/profile.png",
    bio: [
      "Software Engineer with 5+ years of experience building backend platforms and DevOps automation for high-availability systems.",
      "Currently a Software Engineer II at AbbVie, developing NodeJS APIs that support critical services and internal platforms.",
      "I design resilient APIs, automate delivery with modern CI/CD, and turn complex infrastructure into dependable products."
    ]
  },

  // ----------------------------------------------------------
  // Quick Stats  (shown in the Settings "About Me" card)
  // Each entry is a label + value pair.
  // ----------------------------------------------------------
  quickStats: [
    { label: "Experience", value: "5+ years" },
    { label: "Current",    value: "Software Engineer II @ AbbVie" },
    { label: "Education",  value: "M.S. Computer Science, San Diego State University" },
    { label: "Focus",      value: "Backend Engineering \u2022 DevOps \u2022 Cloud Infrastructure" }
  ],

  // ----------------------------------------------------------
  // Education
  // ----------------------------------------------------------
  education: [
    {
      school: "San Diego State University",
      period: "Aug 2022 - May 2024",
      degree: "M.S. Computer Science",
      grade: "GPA: 3.77/4"
    },
    {
      school: "Pune University",
      period: "Aug 2015 - May 2019",
      degree: "Computer Science & Engineering",
      grade: "GPA: 3.66/4"
    }
  ],

  // ----------------------------------------------------------
  // Skills
  // ----------------------------------------------------------
  skills: {
    summary: [
      "Backend and DevOps specialist focused on reliable, scalable systems and cloud automation.",
      "Strong in system designing, cloud services, event-driven architectures, and infrastructure as code."
    ],
    proficient: [
      "Java", "Python", "JavaScript", "Linux/Unix Shell", "SQL", "MongoDB",
      "Spring Boot", "Spring MVC", "NodeJS", "ExpressJS", "Docker",
      "Kubernetes", "Terraform", "Git", "GitHub Actions", "AWS", "Azure"
    ],
    familiar: [
      "Apache Kafka", "RabbitMQ", "Apache Spark", "Temporal",
      "Selenium", "JUnit", "Ansible", "Jenkins", "Helm"
    ]
  },

  // ----------------------------------------------------------
  // Experience
  // ----------------------------------------------------------
  experience: [
    {
      company: "AbbVie",
      role: "Software Engineer II",
      period: "Oct 2024 - Present",
      location: "Remote, Arizona",
      logo: "assets/images/abbvie.svg",
      bullets: [
        "Build and maintain NodeJS APIs that support critical services and internal platforms.",
        "Deliver backend and full-stack features with an emphasis on reliability, performance, and clean API design."
      ]
    },
    {
      company: "AWM Global Advisors",
      role: "Software Engineer",
      period: "Aug 2023 - May 2024",
      location: "San Diego, California",
      logo: "assets/images/awm_logo.jpg",
      bullets: [
        "Built secure RESTful APIs in Java Spring Boot with robust authentication, error handling, and AWS RDS integrations for reliable metric retrieval.",
        "Implemented Apache Kafka streaming to ingest and publish real-time market data for analytics pipelines.",
        "Automated CI/CD with GitHub Actions and Terraform IaC, accelerating deployments by ~50% while improving resiliency.",
        "Led a 6-person team to deliver a web-based banking solution and standardized workflow with Jira and Confluence."
      ]
    },
    {
      company: "Amdocs",
      role: "Senior Software Engineer",
      period: "Sept 2021 - July 2022",
      location: "Pune, India",
      logo: "assets/images/amdocs.svg",
      bullets: [
        "Modernized an on-prem Spring MVC application for Azure, redesigning authentication and optimizing dependencies for 80% performance gains.",
        "Integrated RabbitMQ for asynchronous microservice communication, enabling decoupled scaling.",
        "Built CI pipelines and IaC with Docker, Kubernetes, and Terraform, reducing deployment defects by ~30%.",
        "Led a 5-person team to scope PnL application migration and produce a SaaS transformation roadmap."
      ]
    },
    {
      company: "Deloitte",
      role: "Software Engineer - DC Analyst",
      period: "Jan 2020 - Sept 2021",
      location: "Mumbai, India",
      logo: "assets/images/deloitte.svg",
      bullets: [
        "Developed Python test suites for AWS Lambda using PyTest and Pylint, improving reliability in CodeBuild pipelines.",
        "Automated regression testing with Selenium, cutting manual QA time and improving release stability.",
        "Built REST APIs in NodeJS to integrate external services into the platform.",
        "Maintained and optimized CI/CD with Jenkins, AWS CodeBuild, and CodePipeline."
      ]
    }
  ],

  // ----------------------------------------------------------
  // Projects
  // ----------------------------------------------------------
  projects: [
    {
      name: "SSH Parallel Login",
      url: "",
      description: "Built a Linux automation script to install software across multiple machines concurrently with robust error handling and secure SSH orchestration.",
      tech: "Bash, SSH, Linux"
    },
    {
      name: "Serverless Quiz Game",
      url: "",
      description: "Designed a multiplayer quiz game using serverless architecture with NodeJS and AWS services for scalable gameplay and persistence.",
      tech: "NodeJS, AWS Lambda, API Gateway, DynamoDB, S3"
    },
    {
      name: "JobsExplorer.in",
      url: "https://jobsexplorer.in/",
      description: "Designed a simple web app built to quickly find jobs in India. Search keywords and location to find job listings from 3 of the most popular job sites in India.",
      tech: "NodeJS, Amazon Web Services, JQuery, NGiNX"
    }
  ],

  // ----------------------------------------------------------
  // Contact & Social Links
  // ----------------------------------------------------------
  contact: {
    github: "https://github.com/abdulnine7",
    linkedin: "https://www.linkedin.com/in/abdulnine7",
    instagram: "https://www.instagram.com/abddulnine7/",
    instagramHandle: "abddulnine7",
    email: "abdulnine7@gmail.com",
    repo: "https://github.com/abdulnine7/abdulnine7.github.io"
  },

  // ----------------------------------------------------------
  // Resume
  // ----------------------------------------------------------
  resume: {
    pdf: "assets/pdf/Abdul_Sheikh_Resume.pdf"
  },

  // ----------------------------------------------------------
  // About Desktop  (shown in Settings → About Desktop)
  // ----------------------------------------------------------
  aboutDesktop: {
    madeWith: "Made with Love and Agentic Engineering (Codex and Claude)",
    inspiredBy: "Inspired by Ubuntu GNOME",
    domain: "linuxy.us",
    copyright: "\u00a9 Abdul Noushad Sheikh 2026",
    osName: "Ubuntu Desktop Web",
    osVersion: "Designed by Abdul Noushad Sheikh"
  }
};
