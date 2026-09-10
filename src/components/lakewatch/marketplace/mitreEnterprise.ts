// Generated from the official MITRE ATT&CK Enterprise v19.2 STIX 2.1 bundle.
// Source: https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack-19.2.json
// Revoked and deprecated techniques are intentionally excluded.

export type MitreTechniqueOption = {
  id: string
  name: string
  subtechnique: boolean
}

export type MitreTacticGroup = {
  id: string
  name: string
  techniques: MitreTechniqueOption[]
}

export const MITRE_ENTERPRISE_VERSION = "19.2"

export const MITRE_ENTERPRISE_TACTICS: MitreTacticGroup[] = [
  {
    "id": "reconnaissance",
    "name": "Reconnaissance",
    "techniques": [
      {
        "id": "T1595",
        "name": "Active Scanning",
        "subtechnique": false
      },
      {
        "id": "T1591.002",
        "name": "Business Relationships",
        "subtechnique": true
      },
      {
        "id": "T1596.004",
        "name": "CDNs",
        "subtechnique": true
      },
      {
        "id": "T1592.004",
        "name": "Client Configurations",
        "subtechnique": true
      },
      {
        "id": "T1593.003",
        "name": "Code Repositories",
        "subtechnique": true
      },
      {
        "id": "T1589.001",
        "name": "Credentials",
        "subtechnique": true
      },
      {
        "id": "T1591.001",
        "name": "Determine Physical Locations",
        "subtechnique": true
      },
      {
        "id": "T1596.003",
        "name": "Digital Certificates",
        "subtechnique": true
      },
      {
        "id": "T1590.002",
        "name": "DNS",
        "subtechnique": true
      },
      {
        "id": "T1596.001",
        "name": "DNS/Passive DNS",
        "subtechnique": true
      },
      {
        "id": "T1590.001",
        "name": "Domain Properties",
        "subtechnique": true
      },
      {
        "id": "T1589.002",
        "name": "Email Addresses",
        "subtechnique": true
      },
      {
        "id": "T1589.003",
        "name": "Employee Names",
        "subtechnique": true
      },
      {
        "id": "T1592.003",
        "name": "Firmware",
        "subtechnique": true
      },
      {
        "id": "T1592",
        "name": "Gather Victim Host Information",
        "subtechnique": false
      },
      {
        "id": "T1589",
        "name": "Gather Victim Identity Information",
        "subtechnique": false
      },
      {
        "id": "T1590",
        "name": "Gather Victim Network Information",
        "subtechnique": false
      },
      {
        "id": "T1591",
        "name": "Gather Victim Org Information",
        "subtechnique": false
      },
      {
        "id": "T1592.001",
        "name": "Hardware",
        "subtechnique": true
      },
      {
        "id": "T1591.003",
        "name": "Identify Business Tempo",
        "subtechnique": true
      },
      {
        "id": "T1591.004",
        "name": "Identify Roles",
        "subtechnique": true
      },
      {
        "id": "T1590.005",
        "name": "IP Addresses",
        "subtechnique": true
      },
      {
        "id": "T1590.006",
        "name": "Network Security Appliances",
        "subtechnique": true
      },
      {
        "id": "T1590.004",
        "name": "Network Topology",
        "subtechnique": true
      },
      {
        "id": "T1590.003",
        "name": "Network Trust Dependencies",
        "subtechnique": true
      },
      {
        "id": "T1598",
        "name": "Phishing for Information",
        "subtechnique": false
      },
      {
        "id": "T1597.002",
        "name": "Purchase Technical Data",
        "subtechnique": true
      },
      {
        "id": "T1682",
        "name": "Query Public AI Services",
        "subtechnique": false
      },
      {
        "id": "T1596.005",
        "name": "Scan Databases",
        "subtechnique": true
      },
      {
        "id": "T1595.001",
        "name": "Scanning IP Blocks",
        "subtechnique": true
      },
      {
        "id": "T1597",
        "name": "Search Closed Sources",
        "subtechnique": false
      },
      {
        "id": "T1593.002",
        "name": "Search Engines",
        "subtechnique": true
      },
      {
        "id": "T1596",
        "name": "Search Open Technical Databases",
        "subtechnique": false
      },
      {
        "id": "T1593",
        "name": "Search Open Websites/Domains",
        "subtechnique": false
      },
      {
        "id": "T1681",
        "name": "Search Threat Vendor Data",
        "subtechnique": false
      },
      {
        "id": "T1594",
        "name": "Search Victim-Owned Websites",
        "subtechnique": false
      },
      {
        "id": "T1593.001",
        "name": "Social Media",
        "subtechnique": true
      },
      {
        "id": "T1592.002",
        "name": "Software",
        "subtechnique": true
      },
      {
        "id": "T1598.002",
        "name": "Spearphishing Attachment",
        "subtechnique": true
      },
      {
        "id": "T1598.003",
        "name": "Spearphishing Link",
        "subtechnique": true
      },
      {
        "id": "T1598.001",
        "name": "Spearphishing Service",
        "subtechnique": true
      },
      {
        "id": "T1598.004",
        "name": "Spearphishing Voice",
        "subtechnique": true
      },
      {
        "id": "T1597.001",
        "name": "Threat Intel Vendors",
        "subtechnique": true
      },
      {
        "id": "T1595.002",
        "name": "Vulnerability Scanning",
        "subtechnique": true
      },
      {
        "id": "T1596.002",
        "name": "WHOIS",
        "subtechnique": true
      },
      {
        "id": "T1595.003",
        "name": "Wordlist Scanning",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "resource-development",
    "name": "Resource Development",
    "techniques": [
      {
        "id": "T1650",
        "name": "Acquire Access",
        "subtechnique": false
      },
      {
        "id": "T1583",
        "name": "Acquire Infrastructure",
        "subtechnique": false
      },
      {
        "id": "T1588.007",
        "name": "Artificial Intelligence",
        "subtechnique": true
      },
      {
        "id": "T1683.002",
        "name": "Audio-Visual Content",
        "subtechnique": true
      },
      {
        "id": "T1583.005",
        "name": "Botnet",
        "subtechnique": true
      },
      {
        "id": "T1584.005",
        "name": "Botnet",
        "subtechnique": true
      },
      {
        "id": "T1585.003",
        "name": "Cloud Accounts",
        "subtechnique": true
      },
      {
        "id": "T1586.003",
        "name": "Cloud Accounts",
        "subtechnique": true
      },
      {
        "id": "T1587.002",
        "name": "Code Signing Certificates",
        "subtechnique": true
      },
      {
        "id": "T1588.003",
        "name": "Code Signing Certificates",
        "subtechnique": true
      },
      {
        "id": "T1586",
        "name": "Compromise Accounts",
        "subtechnique": false
      },
      {
        "id": "T1584",
        "name": "Compromise Infrastructure",
        "subtechnique": false
      },
      {
        "id": "T1587",
        "name": "Develop Capabilities",
        "subtechnique": false
      },
      {
        "id": "T1587.003",
        "name": "Digital Certificates",
        "subtechnique": true
      },
      {
        "id": "T1588.004",
        "name": "Digital Certificates",
        "subtechnique": true
      },
      {
        "id": "T1583.002",
        "name": "DNS Server",
        "subtechnique": true
      },
      {
        "id": "T1584.002",
        "name": "DNS Server",
        "subtechnique": true
      },
      {
        "id": "T1583.001",
        "name": "Domains",
        "subtechnique": true
      },
      {
        "id": "T1584.001",
        "name": "Domains",
        "subtechnique": true
      },
      {
        "id": "T1608.004",
        "name": "Drive-by Target",
        "subtechnique": true
      },
      {
        "id": "T1585.002",
        "name": "Email Accounts",
        "subtechnique": true
      },
      {
        "id": "T1586.002",
        "name": "Email Accounts",
        "subtechnique": true
      },
      {
        "id": "T1585",
        "name": "Establish Accounts",
        "subtechnique": false
      },
      {
        "id": "T1587.004",
        "name": "Exploits",
        "subtechnique": true
      },
      {
        "id": "T1588.005",
        "name": "Exploits",
        "subtechnique": true
      },
      {
        "id": "T1683",
        "name": "Generate Content",
        "subtechnique": false
      },
      {
        "id": "T1608.003",
        "name": "Install Digital Certificate",
        "subtechnique": true
      },
      {
        "id": "T1608.005",
        "name": "Link Target",
        "subtechnique": true
      },
      {
        "id": "T1583.008",
        "name": "Malvertising",
        "subtechnique": true
      },
      {
        "id": "T1587.001",
        "name": "Malware",
        "subtechnique": true
      },
      {
        "id": "T1588.001",
        "name": "Malware",
        "subtechnique": true
      },
      {
        "id": "T1584.008",
        "name": "Network Devices",
        "subtechnique": true
      },
      {
        "id": "T1588",
        "name": "Obtain Capabilities",
        "subtechnique": false
      },
      {
        "id": "T1608.006",
        "name": "SEO Poisoning",
        "subtechnique": true
      },
      {
        "id": "T1583.004",
        "name": "Server",
        "subtechnique": true
      },
      {
        "id": "T1584.004",
        "name": "Server",
        "subtechnique": true
      },
      {
        "id": "T1583.007",
        "name": "Serverless",
        "subtechnique": true
      },
      {
        "id": "T1584.007",
        "name": "Serverless",
        "subtechnique": true
      },
      {
        "id": "T1585.001",
        "name": "Social Media Accounts",
        "subtechnique": true
      },
      {
        "id": "T1586.001",
        "name": "Social Media Accounts",
        "subtechnique": true
      },
      {
        "id": "T1608",
        "name": "Stage Capabilities",
        "subtechnique": false
      },
      {
        "id": "T1588.002",
        "name": "Tool",
        "subtechnique": true
      },
      {
        "id": "T1608.001",
        "name": "Upload Malware",
        "subtechnique": true
      },
      {
        "id": "T1608.002",
        "name": "Upload Tool",
        "subtechnique": true
      },
      {
        "id": "T1583.003",
        "name": "Virtual Private Server",
        "subtechnique": true
      },
      {
        "id": "T1584.003",
        "name": "Virtual Private Server",
        "subtechnique": true
      },
      {
        "id": "T1588.006",
        "name": "Vulnerabilities",
        "subtechnique": true
      },
      {
        "id": "T1583.006",
        "name": "Web Services",
        "subtechnique": true
      },
      {
        "id": "T1584.006",
        "name": "Web Services",
        "subtechnique": true
      },
      {
        "id": "T1683.001",
        "name": "Written Content",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "initial-access",
    "name": "Initial Access",
    "techniques": [
      {
        "id": "T1078.004",
        "name": "Cloud Accounts",
        "subtechnique": true
      },
      {
        "id": "T1195.003",
        "name": "Compromise Hardware Supply Chain",
        "subtechnique": true
      },
      {
        "id": "T1195.001",
        "name": "Compromise Software Dependencies and Development Tools",
        "subtechnique": true
      },
      {
        "id": "T1195.002",
        "name": "Compromise Software Supply Chain",
        "subtechnique": true
      },
      {
        "id": "T1659",
        "name": "Content Injection",
        "subtechnique": false
      },
      {
        "id": "T1078.001",
        "name": "Default Accounts",
        "subtechnique": true
      },
      {
        "id": "T1078.002",
        "name": "Domain Accounts",
        "subtechnique": true
      },
      {
        "id": "T1189",
        "name": "Drive-by Compromise",
        "subtechnique": false
      },
      {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "subtechnique": false
      },
      {
        "id": "T1133",
        "name": "External Remote Services",
        "subtechnique": false
      },
      {
        "id": "T1200",
        "name": "Hardware Additions",
        "subtechnique": false
      },
      {
        "id": "T1078.003",
        "name": "Local Accounts",
        "subtechnique": true
      },
      {
        "id": "T1566",
        "name": "Phishing",
        "subtechnique": false
      },
      {
        "id": "T1091",
        "name": "Replication Through Removable Media",
        "subtechnique": false
      },
      {
        "id": "T1566.001",
        "name": "Spearphishing Attachment",
        "subtechnique": true
      },
      {
        "id": "T1566.002",
        "name": "Spearphishing Link",
        "subtechnique": true
      },
      {
        "id": "T1566.003",
        "name": "Spearphishing via Service",
        "subtechnique": true
      },
      {
        "id": "T1566.004",
        "name": "Spearphishing Voice",
        "subtechnique": true
      },
      {
        "id": "T1195",
        "name": "Supply Chain Compromise",
        "subtechnique": false
      },
      {
        "id": "T1199",
        "name": "Trusted Relationship",
        "subtechnique": false
      },
      {
        "id": "T1078",
        "name": "Valid Accounts",
        "subtechnique": false
      },
      {
        "id": "T1669",
        "name": "Wi-Fi Networks",
        "subtechnique": false
      }
    ]
  },
  {
    "id": "execution",
    "name": "Execution",
    "techniques": [
      {
        "id": "T1574.014",
        "name": "AppDomainManager",
        "subtechnique": true
      },
      {
        "id": "T1059.002",
        "name": "AppleScript",
        "subtechnique": true
      },
      {
        "id": "T1053.002",
        "name": "At",
        "subtechnique": true
      },
      {
        "id": "T1059.010",
        "name": "AutoHotKey & AutoIT",
        "subtechnique": true
      },
      {
        "id": "T1197",
        "name": "BITS Jobs",
        "subtechnique": false
      },
      {
        "id": "T1127.002",
        "name": "ClickOnce",
        "subtechnique": true
      },
      {
        "id": "T1651",
        "name": "Cloud Administration Command",
        "subtechnique": false
      },
      {
        "id": "T1059.009",
        "name": "Cloud API",
        "subtechnique": true
      },
      {
        "id": "T1059",
        "name": "Command and Scripting Interpreter",
        "subtechnique": false
      },
      {
        "id": "T1559.001",
        "name": "Component Object Model",
        "subtechnique": true
      },
      {
        "id": "T1609",
        "name": "Container Administration Command",
        "subtechnique": false
      },
      {
        "id": "T1059.013",
        "name": "Container CLI/API",
        "subtechnique": true
      },
      {
        "id": "T1053.007",
        "name": "Container Orchestration Job",
        "subtechnique": true
      },
      {
        "id": "T1574.012",
        "name": "COR_PROFILER",
        "subtechnique": true
      },
      {
        "id": "T1053.003",
        "name": "Cron",
        "subtechnique": true
      },
      {
        "id": "T1610",
        "name": "Deploy Container",
        "subtechnique": false
      },
      {
        "id": "T1574.001",
        "name": "DLL",
        "subtechnique": true
      },
      {
        "id": "T1574.004",
        "name": "Dylib Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1559.002",
        "name": "Dynamic Data Exchange",
        "subtechnique": true
      },
      {
        "id": "T1574.006",
        "name": "Dynamic Linker Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1675",
        "name": "ESXi Administration Command",
        "subtechnique": false
      },
      {
        "id": "T1574.005",
        "name": "Executable Installer File Permissions Weakness",
        "subtechnique": true
      },
      {
        "id": "T1203",
        "name": "Exploitation for Client Execution",
        "subtechnique": false
      },
      {
        "id": "T1574",
        "name": "Hijack Execution Flow",
        "subtechnique": false
      },
      {
        "id": "T1059.012",
        "name": "Hypervisor CLI",
        "subtechnique": true
      },
      {
        "id": "T1674",
        "name": "Input Injection",
        "subtechnique": false
      },
      {
        "id": "T1559",
        "name": "Inter-Process Communication",
        "subtechnique": false
      },
      {
        "id": "T1127.003",
        "name": "JamPlus",
        "subtechnique": true
      },
      {
        "id": "T1059.007",
        "name": "JavaScript",
        "subtechnique": true
      },
      {
        "id": "T1574.013",
        "name": "KernelCallbackTable",
        "subtechnique": true
      },
      {
        "id": "T1569.001",
        "name": "Launchctl",
        "subtechnique": true
      },
      {
        "id": "T1059.011",
        "name": "Lua",
        "subtechnique": true
      },
      {
        "id": "T1204.004",
        "name": "Malicious Copy and Paste",
        "subtechnique": true
      },
      {
        "id": "T1204.002",
        "name": "Malicious File",
        "subtechnique": true
      },
      {
        "id": "T1204.003",
        "name": "Malicious Image",
        "subtechnique": true
      },
      {
        "id": "T1204.005",
        "name": "Malicious Library",
        "subtechnique": true
      },
      {
        "id": "T1204.001",
        "name": "Malicious Link",
        "subtechnique": true
      },
      {
        "id": "T1127.001",
        "name": "MSBuild",
        "subtechnique": true
      },
      {
        "id": "T1106",
        "name": "Native API",
        "subtechnique": false
      },
      {
        "id": "T1059.008",
        "name": "Network Device CLI",
        "subtechnique": true
      },
      {
        "id": "T1574.007",
        "name": "Path Interception by PATH Environment Variable",
        "subtechnique": true
      },
      {
        "id": "T1574.008",
        "name": "Path Interception by Search Order Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1574.009",
        "name": "Path Interception by Unquoted Path",
        "subtechnique": true
      },
      {
        "id": "T1677",
        "name": "Poisoned Pipeline Execution",
        "subtechnique": false
      },
      {
        "id": "T1059.001",
        "name": "PowerShell",
        "subtechnique": true
      },
      {
        "id": "T1059.006",
        "name": "Python",
        "subtechnique": true
      },
      {
        "id": "T1053.005",
        "name": "Scheduled Task",
        "subtechnique": true
      },
      {
        "id": "T1053",
        "name": "Scheduled Task/Job",
        "subtechnique": false
      },
      {
        "id": "T1648",
        "name": "Serverless Execution",
        "subtechnique": false
      },
      {
        "id": "T1569.002",
        "name": "Service Execution",
        "subtechnique": true
      },
      {
        "id": "T1574.010",
        "name": "Services File Permissions Weakness",
        "subtechnique": true
      },
      {
        "id": "T1574.011",
        "name": "Services Registry Permissions Weakness",
        "subtechnique": true
      },
      {
        "id": "T1129",
        "name": "Shared Modules",
        "subtechnique": false
      },
      {
        "id": "T1072",
        "name": "Software Deployment Tools",
        "subtechnique": false
      },
      {
        "id": "T1569",
        "name": "System Services",
        "subtechnique": false
      },
      {
        "id": "T1569.003",
        "name": "Systemctl",
        "subtechnique": true
      },
      {
        "id": "T1053.006",
        "name": "Systemd Timers",
        "subtechnique": true
      },
      {
        "id": "T1127",
        "name": "Trusted Developer Utilities Proxy Execution",
        "subtechnique": false
      },
      {
        "id": "T1059.004",
        "name": "Unix Shell",
        "subtechnique": true
      },
      {
        "id": "T1204",
        "name": "User Execution",
        "subtechnique": false
      },
      {
        "id": "T1059.005",
        "name": "Visual Basic",
        "subtechnique": true
      },
      {
        "id": "T1059.003",
        "name": "Windows Command Shell",
        "subtechnique": true
      },
      {
        "id": "T1047",
        "name": "Windows Management Instrumentation",
        "subtechnique": false
      },
      {
        "id": "T1559.003",
        "name": "XPC Services",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "persistence",
    "name": "Persistence",
    "techniques": [
      {
        "id": "T1546.008",
        "name": "Accessibility Features",
        "subtechnique": true
      },
      {
        "id": "T1098",
        "name": "Account Manipulation",
        "subtechnique": false
      },
      {
        "id": "T1547.014",
        "name": "Active Setup",
        "subtechnique": true
      },
      {
        "id": "T1137.006",
        "name": "Add-ins",
        "subtechnique": true
      },
      {
        "id": "T1098.001",
        "name": "Additional Cloud Credentials",
        "subtechnique": true
      },
      {
        "id": "T1098.003",
        "name": "Additional Cloud Roles",
        "subtechnique": true
      },
      {
        "id": "T1098.006",
        "name": "Additional Container Cluster Roles",
        "subtechnique": true
      },
      {
        "id": "T1098.002",
        "name": "Additional Email Delegate Permissions",
        "subtechnique": true
      },
      {
        "id": "T1098.007",
        "name": "Additional Local or Domain Groups",
        "subtechnique": true
      },
      {
        "id": "T1546.009",
        "name": "AppCert DLLs",
        "subtechnique": true
      },
      {
        "id": "T1546.010",
        "name": "AppInit DLLs",
        "subtechnique": true
      },
      {
        "id": "T1546.011",
        "name": "Application Shimming",
        "subtechnique": true
      },
      {
        "id": "T1053.002",
        "name": "At",
        "subtechnique": true
      },
      {
        "id": "T1547.002",
        "name": "Authentication Package",
        "subtechnique": true
      },
      {
        "id": "T1197",
        "name": "BITS Jobs",
        "subtechnique": false
      },
      {
        "id": "T1547",
        "name": "Boot or Logon Autostart Execution",
        "subtechnique": false
      },
      {
        "id": "T1037",
        "name": "Boot or Logon Initialization Scripts",
        "subtechnique": false
      },
      {
        "id": "T1542.003",
        "name": "Bootkit",
        "subtechnique": true
      },
      {
        "id": "T1176.001",
        "name": "Browser Extensions",
        "subtechnique": true
      },
      {
        "id": "T1546.001",
        "name": "Change Default File Association",
        "subtechnique": true
      },
      {
        "id": "T1136.003",
        "name": "Cloud Account",
        "subtechnique": true
      },
      {
        "id": "T1078.004",
        "name": "Cloud Accounts",
        "subtechnique": true
      },
      {
        "id": "T1671",
        "name": "Cloud Application Integration",
        "subtechnique": false
      },
      {
        "id": "T1542.002",
        "name": "Component Firmware",
        "subtechnique": true
      },
      {
        "id": "T1546.015",
        "name": "Component Object Model Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1554",
        "name": "Compromise Host Software Binary",
        "subtechnique": false
      },
      {
        "id": "T1556.009",
        "name": "Conditional Access Policies",
        "subtechnique": true
      },
      {
        "id": "T1053.007",
        "name": "Container Orchestration Job",
        "subtechnique": true
      },
      {
        "id": "T1543.005",
        "name": "Container Service",
        "subtechnique": true
      },
      {
        "id": "T1136",
        "name": "Create Account",
        "subtechnique": false
      },
      {
        "id": "T1543",
        "name": "Create or Modify System Process",
        "subtechnique": false
      },
      {
        "id": "T1053.003",
        "name": "Cron",
        "subtechnique": true
      },
      {
        "id": "T1078.001",
        "name": "Default Accounts",
        "subtechnique": true
      },
      {
        "id": "T1098.005",
        "name": "Device Registration",
        "subtechnique": true
      },
      {
        "id": "T1136.002",
        "name": "Domain Account",
        "subtechnique": true
      },
      {
        "id": "T1078.002",
        "name": "Domain Accounts",
        "subtechnique": true
      },
      {
        "id": "T1556.001",
        "name": "Domain Controller Authentication",
        "subtechnique": true
      },
      {
        "id": "T1546.014",
        "name": "Emond",
        "subtechnique": true
      },
      {
        "id": "T1546",
        "name": "Event Triggered Execution",
        "subtechnique": false
      },
      {
        "id": "T1668",
        "name": "Exclusive Control",
        "subtechnique": false
      },
      {
        "id": "T1133",
        "name": "External Remote Services",
        "subtechnique": false
      },
      {
        "id": "T1556.007",
        "name": "Hybrid Identity",
        "subtechnique": true
      },
      {
        "id": "T1176.002",
        "name": "IDE Extensions",
        "subtechnique": true
      },
      {
        "id": "T1505.004",
        "name": "IIS Components",
        "subtechnique": true
      },
      {
        "id": "T1546.012",
        "name": "Image File Execution Options Injection",
        "subtechnique": true
      },
      {
        "id": "T1525",
        "name": "Implant Internal Image",
        "subtechnique": false
      },
      {
        "id": "T1546.016",
        "name": "Installer Packages",
        "subtechnique": true
      },
      {
        "id": "T1547.006",
        "name": "Kernel Modules and Extensions",
        "subtechnique": true
      },
      {
        "id": "T1543.001",
        "name": "Launch Agent",
        "subtechnique": true
      },
      {
        "id": "T1543.004",
        "name": "Launch Daemon",
        "subtechnique": true
      },
      {
        "id": "T1546.006",
        "name": "LC_LOAD_DYLIB Addition",
        "subtechnique": true
      },
      {
        "id": "T1136.001",
        "name": "Local Account",
        "subtechnique": true
      },
      {
        "id": "T1078.003",
        "name": "Local Accounts",
        "subtechnique": true
      },
      {
        "id": "T1037.002",
        "name": "Login Hook",
        "subtechnique": true
      },
      {
        "id": "T1547.015",
        "name": "Login Items",
        "subtechnique": true
      },
      {
        "id": "T1037.001",
        "name": "Logon Script (Windows)",
        "subtechnique": true
      },
      {
        "id": "T1547.008",
        "name": "LSASS Driver",
        "subtechnique": true
      },
      {
        "id": "T1556",
        "name": "Modify Authentication Process",
        "subtechnique": false
      },
      {
        "id": "T1112",
        "name": "Modify Registry",
        "subtechnique": false
      },
      {
        "id": "T1556.006",
        "name": "Multi-Factor Authentication",
        "subtechnique": true
      },
      {
        "id": "T1546.007",
        "name": "Netsh Helper DLL",
        "subtechnique": true
      },
      {
        "id": "T1556.004",
        "name": "Network Device Authentication",
        "subtechnique": true
      },
      {
        "id": "T1037.003",
        "name": "Network Logon Script",
        "subtechnique": true
      },
      {
        "id": "T1556.008",
        "name": "Network Provider DLL",
        "subtechnique": true
      },
      {
        "id": "T1137",
        "name": "Office Application Startup",
        "subtechnique": false
      },
      {
        "id": "T1137.001",
        "name": "Office Template Macros",
        "subtechnique": true
      },
      {
        "id": "T1137.002",
        "name": "Office Test",
        "subtechnique": true
      },
      {
        "id": "T1137.003",
        "name": "Outlook Forms",
        "subtechnique": true
      },
      {
        "id": "T1137.004",
        "name": "Outlook Home Page",
        "subtechnique": true
      },
      {
        "id": "T1137.005",
        "name": "Outlook Rules",
        "subtechnique": true
      },
      {
        "id": "T1556.002",
        "name": "Password Filter DLL",
        "subtechnique": true
      },
      {
        "id": "T1556.003",
        "name": "Pluggable Authentication Modules",
        "subtechnique": true
      },
      {
        "id": "T1205.001",
        "name": "Port Knocking",
        "subtechnique": true
      },
      {
        "id": "T1547.010",
        "name": "Port Monitors",
        "subtechnique": true
      },
      {
        "id": "T1653",
        "name": "Power Settings",
        "subtechnique": false
      },
      {
        "id": "T1546.013",
        "name": "PowerShell Profile",
        "subtechnique": true
      },
      {
        "id": "T1542",
        "name": "Pre-OS Boot",
        "subtechnique": false
      },
      {
        "id": "T1547.012",
        "name": "Print Processors",
        "subtechnique": true
      },
      {
        "id": "T1546.018",
        "name": "Python Startup Hooks",
        "subtechnique": true
      },
      {
        "id": "T1037.004",
        "name": "RC Scripts",
        "subtechnique": true
      },
      {
        "id": "T1547.007",
        "name": "Re-opened Applications",
        "subtechnique": true
      },
      {
        "id": "T1547.001",
        "name": "Registry Run Keys / Startup Folder",
        "subtechnique": true
      },
      {
        "id": "T1556.005",
        "name": "Reversible Encryption",
        "subtechnique": true
      },
      {
        "id": "T1542.004",
        "name": "ROMMONkit",
        "subtechnique": true
      },
      {
        "id": "T1053.005",
        "name": "Scheduled Task",
        "subtechnique": true
      },
      {
        "id": "T1053",
        "name": "Scheduled Task/Job",
        "subtechnique": false
      },
      {
        "id": "T1546.002",
        "name": "Screensaver",
        "subtechnique": true
      },
      {
        "id": "T1547.005",
        "name": "Security Support Provider",
        "subtechnique": true
      },
      {
        "id": "T1505",
        "name": "Server Software Component",
        "subtechnique": false
      },
      {
        "id": "T1547.009",
        "name": "Shortcut Modification",
        "subtechnique": true
      },
      {
        "id": "T1205.002",
        "name": "Socket Filters",
        "subtechnique": true
      },
      {
        "id": "T1176",
        "name": "Software Extensions",
        "subtechnique": false
      },
      {
        "id": "T1505.001",
        "name": "SQL Stored Procedures",
        "subtechnique": true
      },
      {
        "id": "T1098.004",
        "name": "SSH Authorized Keys",
        "subtechnique": true
      },
      {
        "id": "T1037.005",
        "name": "Startup Items",
        "subtechnique": true
      },
      {
        "id": "T1542.001",
        "name": "System Firmware",
        "subtechnique": true
      },
      {
        "id": "T1543.002",
        "name": "Systemd Service",
        "subtechnique": true
      },
      {
        "id": "T1053.006",
        "name": "Systemd Timers",
        "subtechnique": true
      },
      {
        "id": "T1505.005",
        "name": "Terminal Services DLL",
        "subtechnique": true
      },
      {
        "id": "T1542.005",
        "name": "TFTP Boot",
        "subtechnique": true
      },
      {
        "id": "T1547.003",
        "name": "Time Providers",
        "subtechnique": true
      },
      {
        "id": "T1205",
        "name": "Traffic Signaling",
        "subtechnique": false
      },
      {
        "id": "T1505.002",
        "name": "Transport Agent",
        "subtechnique": true
      },
      {
        "id": "T1546.005",
        "name": "Trap",
        "subtechnique": true
      },
      {
        "id": "T1546.017",
        "name": "Udev Rules",
        "subtechnique": true
      },
      {
        "id": "T1546.004",
        "name": "Unix Shell Configuration Modification",
        "subtechnique": true
      },
      {
        "id": "T1078",
        "name": "Valid Accounts",
        "subtechnique": false
      },
      {
        "id": "T1505.006",
        "name": "vSphere Installation Bundles",
        "subtechnique": true
      },
      {
        "id": "T1505.003",
        "name": "Web Shell",
        "subtechnique": true
      },
      {
        "id": "T1546.003",
        "name": "Windows Management Instrumentation Event Subscription",
        "subtechnique": true
      },
      {
        "id": "T1543.003",
        "name": "Windows Service",
        "subtechnique": true
      },
      {
        "id": "T1547.004",
        "name": "Winlogon Helper DLL",
        "subtechnique": true
      },
      {
        "id": "T1547.013",
        "name": "XDG Autostart Entries",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "privilege-escalation",
    "name": "Privilege Escalation",
    "techniques": [
      {
        "id": "T1548",
        "name": "Abuse Elevation Control Mechanism",
        "subtechnique": false
      },
      {
        "id": "T1134",
        "name": "Access Token Manipulation",
        "subtechnique": false
      },
      {
        "id": "T1546.008",
        "name": "Accessibility Features",
        "subtechnique": true
      },
      {
        "id": "T1098",
        "name": "Account Manipulation",
        "subtechnique": false
      },
      {
        "id": "T1547.014",
        "name": "Active Setup",
        "subtechnique": true
      },
      {
        "id": "T1098.001",
        "name": "Additional Cloud Credentials",
        "subtechnique": true
      },
      {
        "id": "T1098.003",
        "name": "Additional Cloud Roles",
        "subtechnique": true
      },
      {
        "id": "T1098.006",
        "name": "Additional Container Cluster Roles",
        "subtechnique": true
      },
      {
        "id": "T1098.002",
        "name": "Additional Email Delegate Permissions",
        "subtechnique": true
      },
      {
        "id": "T1098.007",
        "name": "Additional Local or Domain Groups",
        "subtechnique": true
      },
      {
        "id": "T1546.009",
        "name": "AppCert DLLs",
        "subtechnique": true
      },
      {
        "id": "T1546.010",
        "name": "AppInit DLLs",
        "subtechnique": true
      },
      {
        "id": "T1546.011",
        "name": "Application Shimming",
        "subtechnique": true
      },
      {
        "id": "T1055.004",
        "name": "Asynchronous Procedure Call",
        "subtechnique": true
      },
      {
        "id": "T1053.002",
        "name": "At",
        "subtechnique": true
      },
      {
        "id": "T1547.002",
        "name": "Authentication Package",
        "subtechnique": true
      },
      {
        "id": "T1547",
        "name": "Boot or Logon Autostart Execution",
        "subtechnique": false
      },
      {
        "id": "T1037",
        "name": "Boot or Logon Initialization Scripts",
        "subtechnique": false
      },
      {
        "id": "T1548.002",
        "name": "Bypass User Account Control",
        "subtechnique": true
      },
      {
        "id": "T1546.001",
        "name": "Change Default File Association",
        "subtechnique": true
      },
      {
        "id": "T1078.004",
        "name": "Cloud Accounts",
        "subtechnique": true
      },
      {
        "id": "T1546.015",
        "name": "Component Object Model Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1053.007",
        "name": "Container Orchestration Job",
        "subtechnique": true
      },
      {
        "id": "T1543.005",
        "name": "Container Service",
        "subtechnique": true
      },
      {
        "id": "T1543",
        "name": "Create or Modify System Process",
        "subtechnique": false
      },
      {
        "id": "T1134.002",
        "name": "Create Process with Token",
        "subtechnique": true
      },
      {
        "id": "T1053.003",
        "name": "Cron",
        "subtechnique": true
      },
      {
        "id": "T1078.001",
        "name": "Default Accounts",
        "subtechnique": true
      },
      {
        "id": "T1098.005",
        "name": "Device Registration",
        "subtechnique": true
      },
      {
        "id": "T1078.002",
        "name": "Domain Accounts",
        "subtechnique": true
      },
      {
        "id": "T1484",
        "name": "Domain or Tenant Policy Modification",
        "subtechnique": false
      },
      {
        "id": "T1055.001",
        "name": "Dynamic-link Library Injection",
        "subtechnique": true
      },
      {
        "id": "T1548.004",
        "name": "Elevated Execution with Prompt",
        "subtechnique": true
      },
      {
        "id": "T1546.014",
        "name": "Emond",
        "subtechnique": true
      },
      {
        "id": "T1611",
        "name": "Escape to Host",
        "subtechnique": false
      },
      {
        "id": "T1546",
        "name": "Event Triggered Execution",
        "subtechnique": false
      },
      {
        "id": "T1068",
        "name": "Exploitation for Privilege Escalation",
        "subtechnique": false
      },
      {
        "id": "T1055.011",
        "name": "Extra Window Memory Injection",
        "subtechnique": true
      },
      {
        "id": "T1484.001",
        "name": "Group Policy Modification",
        "subtechnique": true
      },
      {
        "id": "T1546.012",
        "name": "Image File Execution Options Injection",
        "subtechnique": true
      },
      {
        "id": "T1546.016",
        "name": "Installer Packages",
        "subtechnique": true
      },
      {
        "id": "T1547.006",
        "name": "Kernel Modules and Extensions",
        "subtechnique": true
      },
      {
        "id": "T1543.001",
        "name": "Launch Agent",
        "subtechnique": true
      },
      {
        "id": "T1543.004",
        "name": "Launch Daemon",
        "subtechnique": true
      },
      {
        "id": "T1546.006",
        "name": "LC_LOAD_DYLIB Addition",
        "subtechnique": true
      },
      {
        "id": "T1055.015",
        "name": "ListPlanting",
        "subtechnique": true
      },
      {
        "id": "T1078.003",
        "name": "Local Accounts",
        "subtechnique": true
      },
      {
        "id": "T1037.002",
        "name": "Login Hook",
        "subtechnique": true
      },
      {
        "id": "T1547.015",
        "name": "Login Items",
        "subtechnique": true
      },
      {
        "id": "T1037.001",
        "name": "Logon Script (Windows)",
        "subtechnique": true
      },
      {
        "id": "T1547.008",
        "name": "LSASS Driver",
        "subtechnique": true
      },
      {
        "id": "T1134.003",
        "name": "Make and Impersonate Token",
        "subtechnique": true
      },
      {
        "id": "T1546.007",
        "name": "Netsh Helper DLL",
        "subtechnique": true
      },
      {
        "id": "T1037.003",
        "name": "Network Logon Script",
        "subtechnique": true
      },
      {
        "id": "T1134.004",
        "name": "Parent PID Spoofing",
        "subtechnique": true
      },
      {
        "id": "T1547.010",
        "name": "Port Monitors",
        "subtechnique": true
      },
      {
        "id": "T1055.002",
        "name": "Portable Executable Injection",
        "subtechnique": true
      },
      {
        "id": "T1546.013",
        "name": "PowerShell Profile",
        "subtechnique": true
      },
      {
        "id": "T1547.012",
        "name": "Print Processors",
        "subtechnique": true
      },
      {
        "id": "T1055.009",
        "name": "Proc Memory",
        "subtechnique": true
      },
      {
        "id": "T1055.013",
        "name": "Process Doppelgänging",
        "subtechnique": true
      },
      {
        "id": "T1055.012",
        "name": "Process Hollowing",
        "subtechnique": true
      },
      {
        "id": "T1055",
        "name": "Process Injection",
        "subtechnique": false
      },
      {
        "id": "T1055.008",
        "name": "Ptrace System Calls",
        "subtechnique": true
      },
      {
        "id": "T1546.018",
        "name": "Python Startup Hooks",
        "subtechnique": true
      },
      {
        "id": "T1037.004",
        "name": "RC Scripts",
        "subtechnique": true
      },
      {
        "id": "T1547.007",
        "name": "Re-opened Applications",
        "subtechnique": true
      },
      {
        "id": "T1547.001",
        "name": "Registry Run Keys / Startup Folder",
        "subtechnique": true
      },
      {
        "id": "T1053.005",
        "name": "Scheduled Task",
        "subtechnique": true
      },
      {
        "id": "T1053",
        "name": "Scheduled Task/Job",
        "subtechnique": false
      },
      {
        "id": "T1546.002",
        "name": "Screensaver",
        "subtechnique": true
      },
      {
        "id": "T1547.005",
        "name": "Security Support Provider",
        "subtechnique": true
      },
      {
        "id": "T1548.001",
        "name": "Setuid and Setgid",
        "subtechnique": true
      },
      {
        "id": "T1547.009",
        "name": "Shortcut Modification",
        "subtechnique": true
      },
      {
        "id": "T1134.005",
        "name": "SID-History Injection",
        "subtechnique": true
      },
      {
        "id": "T1098.004",
        "name": "SSH Authorized Keys",
        "subtechnique": true
      },
      {
        "id": "T1037.005",
        "name": "Startup Items",
        "subtechnique": true
      },
      {
        "id": "T1548.003",
        "name": "Sudo and Sudo Caching",
        "subtechnique": true
      },
      {
        "id": "T1543.002",
        "name": "Systemd Service",
        "subtechnique": true
      },
      {
        "id": "T1053.006",
        "name": "Systemd Timers",
        "subtechnique": true
      },
      {
        "id": "T1548.006",
        "name": "TCC Manipulation",
        "subtechnique": true
      },
      {
        "id": "T1548.005",
        "name": "Temporary Elevated Cloud Access",
        "subtechnique": true
      },
      {
        "id": "T1055.003",
        "name": "Thread Execution Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1055.005",
        "name": "Thread Local Storage",
        "subtechnique": true
      },
      {
        "id": "T1547.003",
        "name": "Time Providers",
        "subtechnique": true
      },
      {
        "id": "T1134.001",
        "name": "Token Impersonation/Theft",
        "subtechnique": true
      },
      {
        "id": "T1546.005",
        "name": "Trap",
        "subtechnique": true
      },
      {
        "id": "T1484.002",
        "name": "Trust Modification",
        "subtechnique": true
      },
      {
        "id": "T1546.017",
        "name": "Udev Rules",
        "subtechnique": true
      },
      {
        "id": "T1546.004",
        "name": "Unix Shell Configuration Modification",
        "subtechnique": true
      },
      {
        "id": "T1078",
        "name": "Valid Accounts",
        "subtechnique": false
      },
      {
        "id": "T1055.014",
        "name": "VDSO Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1546.003",
        "name": "Windows Management Instrumentation Event Subscription",
        "subtechnique": true
      },
      {
        "id": "T1543.003",
        "name": "Windows Service",
        "subtechnique": true
      },
      {
        "id": "T1547.004",
        "name": "Winlogon Helper DLL",
        "subtechnique": true
      },
      {
        "id": "T1547.013",
        "name": "XDG Autostart Entries",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "stealth",
    "name": "Stealth",
    "techniques": [
      {
        "id": "T1134",
        "name": "Access Token Manipulation",
        "subtechnique": false
      },
      {
        "id": "T1574.014",
        "name": "AppDomainManager",
        "subtechnique": true
      },
      {
        "id": "T1055.004",
        "name": "Asynchronous Procedure Call",
        "subtechnique": true
      },
      {
        "id": "T1027.001",
        "name": "Binary Padding",
        "subtechnique": true
      },
      {
        "id": "T1564.013",
        "name": "Bind Mounts",
        "subtechnique": true
      },
      {
        "id": "T1197",
        "name": "BITS Jobs",
        "subtechnique": false
      },
      {
        "id": "T1542.003",
        "name": "Bootkit",
        "subtechnique": true
      },
      {
        "id": "T1036.009",
        "name": "Break Process Trees",
        "subtechnique": true
      },
      {
        "id": "T1036.012",
        "name": "Browser Fingerprint",
        "subtechnique": true
      },
      {
        "id": "T1612",
        "name": "Build Image on Host",
        "subtechnique": false
      },
      {
        "id": "T1070.003",
        "name": "Clear Command History",
        "subtechnique": true
      },
      {
        "id": "T1070.008",
        "name": "Clear Mailbox Data",
        "subtechnique": true
      },
      {
        "id": "T1070.007",
        "name": "Clear Network Connection History and Configurations",
        "subtechnique": true
      },
      {
        "id": "T1070.009",
        "name": "Clear Persistence",
        "subtechnique": true
      },
      {
        "id": "T1127.002",
        "name": "ClickOnce",
        "subtechnique": true
      },
      {
        "id": "T1078.004",
        "name": "Cloud Accounts",
        "subtechnique": true
      },
      {
        "id": "T1218.003",
        "name": "CMSTP",
        "subtechnique": true
      },
      {
        "id": "T1027.010",
        "name": "Command Obfuscation",
        "subtechnique": true
      },
      {
        "id": "T1027.004",
        "name": "Compile After Delivery",
        "subtechnique": true
      },
      {
        "id": "T1218.001",
        "name": "Compiled HTML File",
        "subtechnique": true
      },
      {
        "id": "T1542.002",
        "name": "Component Firmware",
        "subtechnique": true
      },
      {
        "id": "T1027.015",
        "name": "Compression",
        "subtechnique": true
      },
      {
        "id": "T1218.002",
        "name": "Control Panel",
        "subtechnique": true
      },
      {
        "id": "T1574.012",
        "name": "COR_PROFILER",
        "subtechnique": true
      },
      {
        "id": "T1134.002",
        "name": "Create Process with Token",
        "subtechnique": true
      },
      {
        "id": "T1622",
        "name": "Debugger Evasion",
        "subtechnique": false
      },
      {
        "id": "T1078.001",
        "name": "Default Accounts",
        "subtechnique": true
      },
      {
        "id": "T1678",
        "name": "Delay Execution",
        "subtechnique": false
      },
      {
        "id": "T1140",
        "name": "Deobfuscate/Decode Files or Information",
        "subtechnique": false
      },
      {
        "id": "T1006",
        "name": "Direct Volume Access",
        "subtechnique": false
      },
      {
        "id": "T1574.001",
        "name": "DLL",
        "subtechnique": true
      },
      {
        "id": "T1078.002",
        "name": "Domain Accounts",
        "subtechnique": true
      },
      {
        "id": "T1036.007",
        "name": "Double File Extension",
        "subtechnique": true
      },
      {
        "id": "T1574.004",
        "name": "Dylib Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1027.007",
        "name": "Dynamic API Resolution",
        "subtechnique": true
      },
      {
        "id": "T1574.006",
        "name": "Dynamic Linker Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1055.001",
        "name": "Dynamic-link Library Injection",
        "subtechnique": true
      },
      {
        "id": "T1218.015",
        "name": "Electron Applications",
        "subtechnique": true
      },
      {
        "id": "T1564.008",
        "name": "Email Hiding Rules",
        "subtechnique": true
      },
      {
        "id": "T1684.002",
        "name": "Email Spoofing",
        "subtechnique": true
      },
      {
        "id": "T1027.009",
        "name": "Embedded Payloads",
        "subtechnique": true
      },
      {
        "id": "T1027.013",
        "name": "Encrypted/Encoded File",
        "subtechnique": true
      },
      {
        "id": "T1480.001",
        "name": "Environmental Keying",
        "subtechnique": true
      },
      {
        "id": "T1574.005",
        "name": "Executable Installer File Permissions Weakness",
        "subtechnique": true
      },
      {
        "id": "T1480",
        "name": "Execution Guardrails",
        "subtechnique": false
      },
      {
        "id": "T1211",
        "name": "Exploitation for Stealth",
        "subtechnique": false
      },
      {
        "id": "T1564.014",
        "name": "Extended Attributes",
        "subtechnique": true
      },
      {
        "id": "T1055.011",
        "name": "Extra Window Memory Injection",
        "subtechnique": true
      },
      {
        "id": "T1070.004",
        "name": "File Deletion",
        "subtechnique": true
      },
      {
        "id": "T1564.012",
        "name": "File/Path Exclusions",
        "subtechnique": true
      },
      {
        "id": "T1027.011",
        "name": "Fileless Storage",
        "subtechnique": true
      },
      {
        "id": "T1564.005",
        "name": "Hidden File System",
        "subtechnique": true
      },
      {
        "id": "T1564.001",
        "name": "Hidden Files and Directories",
        "subtechnique": true
      },
      {
        "id": "T1564.002",
        "name": "Hidden Users",
        "subtechnique": true
      },
      {
        "id": "T1564.003",
        "name": "Hidden Window",
        "subtechnique": true
      },
      {
        "id": "T1564",
        "name": "Hide Artifacts",
        "subtechnique": false
      },
      {
        "id": "T1574",
        "name": "Hijack Execution Flow",
        "subtechnique": false
      },
      {
        "id": "T1027.006",
        "name": "HTML Smuggling",
        "subtechnique": true
      },
      {
        "id": "T1564.011",
        "name": "Ignore Process Interrupts",
        "subtechnique": true
      },
      {
        "id": "T1684.001",
        "name": "Impersonation",
        "subtechnique": true
      },
      {
        "id": "T1070",
        "name": "Indicator Removal",
        "subtechnique": false
      },
      {
        "id": "T1027.005",
        "name": "Indicator Removal from Tools",
        "subtechnique": true
      },
      {
        "id": "T1202",
        "name": "Indirect Command Execution",
        "subtechnique": false
      },
      {
        "id": "T1218.004",
        "name": "InstallUtil",
        "subtechnique": true
      },
      {
        "id": "T1036.001",
        "name": "Invalid Code Signature",
        "subtechnique": true
      },
      {
        "id": "T1027.018",
        "name": "Invisible Unicode",
        "subtechnique": true
      },
      {
        "id": "T1127.003",
        "name": "JamPlus",
        "subtechnique": true
      },
      {
        "id": "T1027.016",
        "name": "Junk Code Insertion",
        "subtechnique": true
      },
      {
        "id": "T1574.013",
        "name": "KernelCallbackTable",
        "subtechnique": true
      },
      {
        "id": "T1055.015",
        "name": "ListPlanting",
        "subtechnique": true
      },
      {
        "id": "T1027.012",
        "name": "LNK Icon Smuggling",
        "subtechnique": true
      },
      {
        "id": "T1078.003",
        "name": "Local Accounts",
        "subtechnique": true
      },
      {
        "id": "T1134.003",
        "name": "Make and Impersonate Token",
        "subtechnique": true
      },
      {
        "id": "T1036.010",
        "name": "Masquerade Account Name",
        "subtechnique": true
      },
      {
        "id": "T1036.008",
        "name": "Masquerade File Type",
        "subtechnique": true
      },
      {
        "id": "T1036.004",
        "name": "Masquerade Task or Service",
        "subtechnique": true
      },
      {
        "id": "T1036",
        "name": "Masquerading",
        "subtechnique": false
      },
      {
        "id": "T1036.005",
        "name": "Match Legitimate Resource Name or Location",
        "subtechnique": true
      },
      {
        "id": "T1218.013",
        "name": "Mavinject",
        "subtechnique": true
      },
      {
        "id": "T1218.014",
        "name": "MMC",
        "subtechnique": true
      },
      {
        "id": "T1127.001",
        "name": "MSBuild",
        "subtechnique": true
      },
      {
        "id": "T1218.005",
        "name": "Mshta",
        "subtechnique": true
      },
      {
        "id": "T1218.007",
        "name": "Msiexec",
        "subtechnique": true
      },
      {
        "id": "T1480.002",
        "name": "Mutual Exclusion",
        "subtechnique": true
      },
      {
        "id": "T1070.005",
        "name": "Network Share Connection Removal",
        "subtechnique": true
      },
      {
        "id": "T1564.004",
        "name": "NTFS File Attributes",
        "subtechnique": true
      },
      {
        "id": "T1027",
        "name": "Obfuscated Files or Information",
        "subtechnique": false
      },
      {
        "id": "T1218.008",
        "name": "Odbcconf",
        "subtechnique": true
      },
      {
        "id": "T1036.011",
        "name": "Overwrite Process Arguments",
        "subtechnique": true
      },
      {
        "id": "T1134.004",
        "name": "Parent PID Spoofing",
        "subtechnique": true
      },
      {
        "id": "T1574.007",
        "name": "Path Interception by PATH Environment Variable",
        "subtechnique": true
      },
      {
        "id": "T1574.008",
        "name": "Path Interception by Search Order Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1574.009",
        "name": "Path Interception by Unquoted Path",
        "subtechnique": true
      },
      {
        "id": "T1027.014",
        "name": "Polymorphic Code",
        "subtechnique": true
      },
      {
        "id": "T1205.001",
        "name": "Port Knocking",
        "subtechnique": true
      },
      {
        "id": "T1055.002",
        "name": "Portable Executable Injection",
        "subtechnique": true
      },
      {
        "id": "T1542",
        "name": "Pre-OS Boot",
        "subtechnique": false
      },
      {
        "id": "T1055.009",
        "name": "Proc Memory",
        "subtechnique": true
      },
      {
        "id": "T1564.010",
        "name": "Process Argument Spoofing",
        "subtechnique": true
      },
      {
        "id": "T1055.013",
        "name": "Process Doppelgänging",
        "subtechnique": true
      },
      {
        "id": "T1055.012",
        "name": "Process Hollowing",
        "subtechnique": true
      },
      {
        "id": "T1055",
        "name": "Process Injection",
        "subtechnique": false
      },
      {
        "id": "T1055.008",
        "name": "Ptrace System Calls",
        "subtechnique": true
      },
      {
        "id": "T1216.001",
        "name": "PubPrn",
        "subtechnique": true
      },
      {
        "id": "T1620",
        "name": "Reflective Code Loading",
        "subtechnique": false
      },
      {
        "id": "T1218.009",
        "name": "Regsvcs/Regasm",
        "subtechnique": true
      },
      {
        "id": "T1218.010",
        "name": "Regsvr32",
        "subtechnique": true
      },
      {
        "id": "T1070.010",
        "name": "Relocate Malware",
        "subtechnique": true
      },
      {
        "id": "T1036.003",
        "name": "Rename Legitimate Utilities",
        "subtechnique": true
      },
      {
        "id": "T1564.009",
        "name": "Resource Forking",
        "subtechnique": true
      },
      {
        "id": "T1036.002",
        "name": "Right-to-Left Override",
        "subtechnique": true
      },
      {
        "id": "T1542.004",
        "name": "ROMMONkit",
        "subtechnique": true
      },
      {
        "id": "T1014",
        "name": "Rootkit",
        "subtechnique": false
      },
      {
        "id": "T1564.006",
        "name": "Run Virtual Instance",
        "subtechnique": true
      },
      {
        "id": "T1218.011",
        "name": "Rundll32",
        "subtechnique": true
      },
      {
        "id": "T1679",
        "name": "Selective Exclusion",
        "subtechnique": false
      },
      {
        "id": "T1574.010",
        "name": "Services File Permissions Weakness",
        "subtechnique": true
      },
      {
        "id": "T1574.011",
        "name": "Services Registry Permissions Weakness",
        "subtechnique": true
      },
      {
        "id": "T1134.005",
        "name": "SID-History Injection",
        "subtechnique": true
      },
      {
        "id": "T1684",
        "name": "Social Engineering",
        "subtechnique": false
      },
      {
        "id": "T1205.002",
        "name": "Socket Filters",
        "subtechnique": true
      },
      {
        "id": "T1027.002",
        "name": "Software Packing",
        "subtechnique": true
      },
      {
        "id": "T1036.006",
        "name": "Space after Filename",
        "subtechnique": true
      },
      {
        "id": "T1027.003",
        "name": "Steganography",
        "subtechnique": true
      },
      {
        "id": "T1027.008",
        "name": "Stripped Payloads",
        "subtechnique": true
      },
      {
        "id": "T1027.017",
        "name": "SVG Smuggling",
        "subtechnique": true
      },
      {
        "id": "T1216.002",
        "name": "SyncAppvPublishingServer",
        "subtechnique": true
      },
      {
        "id": "T1218",
        "name": "System Binary Proxy Execution",
        "subtechnique": false
      },
      {
        "id": "T1497.001",
        "name": "System Checks",
        "subtechnique": true
      },
      {
        "id": "T1542.001",
        "name": "System Firmware",
        "subtechnique": true
      },
      {
        "id": "T1216",
        "name": "System Script Proxy Execution",
        "subtechnique": false
      },
      {
        "id": "T1221",
        "name": "Template Injection",
        "subtechnique": false
      },
      {
        "id": "T1542.005",
        "name": "TFTP Boot",
        "subtechnique": true
      },
      {
        "id": "T1055.003",
        "name": "Thread Execution Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1055.005",
        "name": "Thread Local Storage",
        "subtechnique": true
      },
      {
        "id": "T1497.003",
        "name": "Time Based Checks",
        "subtechnique": true
      },
      {
        "id": "T1070.006",
        "name": "Timestomp",
        "subtechnique": true
      },
      {
        "id": "T1134.001",
        "name": "Token Impersonation/Theft",
        "subtechnique": true
      },
      {
        "id": "T1205",
        "name": "Traffic Signaling",
        "subtechnique": false
      },
      {
        "id": "T1127",
        "name": "Trusted Developer Utilities Proxy Execution",
        "subtechnique": false
      },
      {
        "id": "T1535",
        "name": "Unused/Unsupported Cloud Regions",
        "subtechnique": false
      },
      {
        "id": "T1497.002",
        "name": "User Activity Based Checks",
        "subtechnique": true
      },
      {
        "id": "T1078",
        "name": "Valid Accounts",
        "subtechnique": false
      },
      {
        "id": "T1564.007",
        "name": "VBA Stomping",
        "subtechnique": true
      },
      {
        "id": "T1055.014",
        "name": "VDSO Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1218.012",
        "name": "Verclsid",
        "subtechnique": true
      },
      {
        "id": "T1497",
        "name": "Virtualization/Sandbox Evasion",
        "subtechnique": false
      },
      {
        "id": "T1220",
        "name": "XSL Script Processing",
        "subtechnique": false
      }
    ]
  },
  {
    "id": "defense-impairment",
    "name": "Defense Impairment",
    "techniques": [
      {
        "id": "T1685.006",
        "name": "Clear Linux or Mac System Logs",
        "subtechnique": true
      },
      {
        "id": "T1685.005",
        "name": "Clear Windows Event Logs",
        "subtechnique": true
      },
      {
        "id": "T1686.001",
        "name": "Cloud Firewall",
        "subtechnique": true
      },
      {
        "id": "T1553.002",
        "name": "Code Signing",
        "subtechnique": true
      },
      {
        "id": "T1553.006",
        "name": "Code Signing Policy Modification",
        "subtechnique": true
      },
      {
        "id": "T1556.009",
        "name": "Conditional Access Policies",
        "subtechnique": true
      },
      {
        "id": "T1578.002",
        "name": "Create Cloud Instance",
        "subtechnique": true
      },
      {
        "id": "T1578.001",
        "name": "Create Snapshot",
        "subtechnique": true
      },
      {
        "id": "T1578.003",
        "name": "Delete Cloud Instance",
        "subtechnique": true
      },
      {
        "id": "T1600.002",
        "name": "Disable Crypto Hardware",
        "subtechnique": true
      },
      {
        "id": "T1685.002",
        "name": "Disable or Modify Cloud Log",
        "subtechnique": true
      },
      {
        "id": "T1685.004",
        "name": "Disable or Modify Linux Audit System Log",
        "subtechnique": true
      },
      {
        "id": "T1686",
        "name": "Disable or Modify System Firewall",
        "subtechnique": false
      },
      {
        "id": "T1685",
        "name": "Disable or Modify Tools",
        "subtechnique": false
      },
      {
        "id": "T1685.001",
        "name": "Disable or Modify Windows Event Log",
        "subtechnique": true
      },
      {
        "id": "T1556.001",
        "name": "Domain Controller Authentication",
        "subtechnique": true
      },
      {
        "id": "T1484",
        "name": "Domain or Tenant Policy Modification",
        "subtechnique": false
      },
      {
        "id": "T1689",
        "name": "Downgrade Attack",
        "subtechnique": false
      },
      {
        "id": "T1601.002",
        "name": "Downgrade System Image",
        "subtechnique": true
      },
      {
        "id": "T1687",
        "name": "Exploitation for Defense Impairment",
        "subtechnique": false
      },
      {
        "id": "T1222",
        "name": "File and Directory Permissions Modification",
        "subtechnique": false
      },
      {
        "id": "T1553.001",
        "name": "Gatekeeper Bypass",
        "subtechnique": true
      },
      {
        "id": "T1484.001",
        "name": "Group Policy Modification",
        "subtechnique": true
      },
      {
        "id": "T1556.007",
        "name": "Hybrid Identity",
        "subtechnique": true
      },
      {
        "id": "T1553.004",
        "name": "Install Root Certificate",
        "subtechnique": true
      },
      {
        "id": "T1222.002",
        "name": "Linux and Mac Permissions",
        "subtechnique": true
      },
      {
        "id": "T1553.005",
        "name": "Mark-of-the-Web Bypass",
        "subtechnique": true
      },
      {
        "id": "T1556",
        "name": "Modify Authentication Process",
        "subtechnique": false
      },
      {
        "id": "T1578.005",
        "name": "Modify Cloud Compute Configurations",
        "subtechnique": true
      },
      {
        "id": "T1578",
        "name": "Modify Cloud Compute Infrastructure",
        "subtechnique": false
      },
      {
        "id": "T1666",
        "name": "Modify Cloud Resource Hierarchy",
        "subtechnique": false
      },
      {
        "id": "T1685.003",
        "name": "Modify or Spoof Tool UI",
        "subtechnique": true
      },
      {
        "id": "T1112",
        "name": "Modify Registry",
        "subtechnique": false
      },
      {
        "id": "T1601",
        "name": "Modify System Image",
        "subtechnique": false
      },
      {
        "id": "T1556.006",
        "name": "Multi-Factor Authentication",
        "subtechnique": true
      },
      {
        "id": "T1599.001",
        "name": "Network Address Translation Traversal",
        "subtechnique": true
      },
      {
        "id": "T1599",
        "name": "Network Boundary Bridging",
        "subtechnique": false
      },
      {
        "id": "T1556.004",
        "name": "Network Device Authentication",
        "subtechnique": true
      },
      {
        "id": "T1686.002",
        "name": "Network Device Firewall",
        "subtechnique": true
      },
      {
        "id": "T1556.008",
        "name": "Network Provider DLL",
        "subtechnique": true
      },
      {
        "id": "T1556.002",
        "name": "Password Filter DLL",
        "subtechnique": true
      },
      {
        "id": "T1601.001",
        "name": "Patch System Image",
        "subtechnique": true
      },
      {
        "id": "T1647",
        "name": "Plist File Modification",
        "subtechnique": false
      },
      {
        "id": "T1556.003",
        "name": "Pluggable Authentication Modules",
        "subtechnique": true
      },
      {
        "id": "T1690",
        "name": "Prevent Command History Logging",
        "subtechnique": false
      },
      {
        "id": "T1600.001",
        "name": "Reduce Key Space",
        "subtechnique": true
      },
      {
        "id": "T1556.005",
        "name": "Reversible Encryption",
        "subtechnique": true
      },
      {
        "id": "T1578.004",
        "name": "Revert Cloud Instance",
        "subtechnique": true
      },
      {
        "id": "T1207",
        "name": "Rogue Domain Controller",
        "subtechnique": false
      },
      {
        "id": "T1688",
        "name": "Safe Mode Boot",
        "subtechnique": false
      },
      {
        "id": "T1553.003",
        "name": "SIP and Trust Provider Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1553",
        "name": "Subvert Trust Controls",
        "subtechnique": false
      },
      {
        "id": "T1484.002",
        "name": "Trust Modification",
        "subtechnique": true
      },
      {
        "id": "T1600",
        "name": "Weaken Encryption",
        "subtechnique": false
      },
      {
        "id": "T1686.003",
        "name": "Windows Host Firewall",
        "subtechnique": true
      },
      {
        "id": "T1222.001",
        "name": "Windows Permissions",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "credential-access",
    "name": "Credential Access",
    "techniques": [
      {
        "id": "T1003.008",
        "name": "/etc/passwd and /etc/shadow",
        "subtechnique": true
      },
      {
        "id": "T1557",
        "name": "Adversary-in-the-Middle",
        "subtechnique": false
      },
      {
        "id": "T1557.002",
        "name": "ARP Cache Poisoning",
        "subtechnique": true
      },
      {
        "id": "T1558.004",
        "name": "AS-REP Roasting",
        "subtechnique": true
      },
      {
        "id": "T1110",
        "name": "Brute Force",
        "subtechnique": false
      },
      {
        "id": "T1003.005",
        "name": "Cached Domain Credentials",
        "subtechnique": true
      },
      {
        "id": "T1558.005",
        "name": "Ccache Files",
        "subtechnique": true
      },
      {
        "id": "T1552.008",
        "name": "Chat Messages",
        "subtechnique": true
      },
      {
        "id": "T1552.005",
        "name": "Cloud Instance Metadata API",
        "subtechnique": true
      },
      {
        "id": "T1555.006",
        "name": "Cloud Secrets Management Stores",
        "subtechnique": true
      },
      {
        "id": "T1556.009",
        "name": "Conditional Access Policies",
        "subtechnique": true
      },
      {
        "id": "T1552.007",
        "name": "Container API",
        "subtechnique": true
      },
      {
        "id": "T1056.004",
        "name": "Credential API Hooking",
        "subtechnique": true
      },
      {
        "id": "T1110.004",
        "name": "Credential Stuffing",
        "subtechnique": true
      },
      {
        "id": "T1555",
        "name": "Credentials from Password Stores",
        "subtechnique": false
      },
      {
        "id": "T1555.003",
        "name": "Credentials from Web Browsers",
        "subtechnique": true
      },
      {
        "id": "T1552.001",
        "name": "Credentials In Files",
        "subtechnique": true
      },
      {
        "id": "T1552.002",
        "name": "Credentials in Registry",
        "subtechnique": true
      },
      {
        "id": "T1003.006",
        "name": "DCSync",
        "subtechnique": true
      },
      {
        "id": "T1557.003",
        "name": "DHCP Spoofing",
        "subtechnique": true
      },
      {
        "id": "T1556.001",
        "name": "Domain Controller Authentication",
        "subtechnique": true
      },
      {
        "id": "T1557.004",
        "name": "Evil Twin",
        "subtechnique": true
      },
      {
        "id": "T1212",
        "name": "Exploitation for Credential Access",
        "subtechnique": false
      },
      {
        "id": "T1187",
        "name": "Forced Authentication",
        "subtechnique": false
      },
      {
        "id": "T1606",
        "name": "Forge Web Credentials",
        "subtechnique": false
      },
      {
        "id": "T1558.001",
        "name": "Golden Ticket",
        "subtechnique": true
      },
      {
        "id": "T1552.006",
        "name": "Group Policy Preferences",
        "subtechnique": true
      },
      {
        "id": "T1056.002",
        "name": "GUI Input Capture",
        "subtechnique": true
      },
      {
        "id": "T1556.007",
        "name": "Hybrid Identity",
        "subtechnique": true
      },
      {
        "id": "T1056",
        "name": "Input Capture",
        "subtechnique": false
      },
      {
        "id": "T1558.003",
        "name": "Kerberoasting",
        "subtechnique": true
      },
      {
        "id": "T1555.001",
        "name": "Keychain",
        "subtechnique": true
      },
      {
        "id": "T1056.001",
        "name": "Keylogging",
        "subtechnique": true
      },
      {
        "id": "T1003.004",
        "name": "LSA Secrets",
        "subtechnique": true
      },
      {
        "id": "T1003.001",
        "name": "LSASS Memory",
        "subtechnique": true
      },
      {
        "id": "T1556",
        "name": "Modify Authentication Process",
        "subtechnique": false
      },
      {
        "id": "T1556.006",
        "name": "Multi-Factor Authentication",
        "subtechnique": true
      },
      {
        "id": "T1111",
        "name": "Multi-Factor Authentication Interception",
        "subtechnique": false
      },
      {
        "id": "T1621",
        "name": "Multi-Factor Authentication Request Generation",
        "subtechnique": false
      },
      {
        "id": "T1557.001",
        "name": "Name Resolution Poisoning and SMB Relay",
        "subtechnique": true
      },
      {
        "id": "T1556.004",
        "name": "Network Device Authentication",
        "subtechnique": true
      },
      {
        "id": "T1556.008",
        "name": "Network Provider DLL",
        "subtechnique": true
      },
      {
        "id": "T1040",
        "name": "Network Sniffing",
        "subtechnique": false
      },
      {
        "id": "T1003.003",
        "name": "NTDS",
        "subtechnique": true
      },
      {
        "id": "T1003",
        "name": "OS Credential Dumping",
        "subtechnique": false
      },
      {
        "id": "T1110.002",
        "name": "Password Cracking",
        "subtechnique": true
      },
      {
        "id": "T1556.002",
        "name": "Password Filter DLL",
        "subtechnique": true
      },
      {
        "id": "T1110.001",
        "name": "Password Guessing",
        "subtechnique": true
      },
      {
        "id": "T1555.005",
        "name": "Password Managers",
        "subtechnique": true
      },
      {
        "id": "T1110.003",
        "name": "Password Spraying",
        "subtechnique": true
      },
      {
        "id": "T1556.003",
        "name": "Pluggable Authentication Modules",
        "subtechnique": true
      },
      {
        "id": "T1552.004",
        "name": "Private Keys",
        "subtechnique": true
      },
      {
        "id": "T1003.007",
        "name": "Proc Filesystem",
        "subtechnique": true
      },
      {
        "id": "T1556.005",
        "name": "Reversible Encryption",
        "subtechnique": true
      },
      {
        "id": "T1606.002",
        "name": "SAML Tokens",
        "subtechnique": true
      },
      {
        "id": "T1003.002",
        "name": "Security Account Manager",
        "subtechnique": true
      },
      {
        "id": "T1555.002",
        "name": "Securityd Memory",
        "subtechnique": true
      },
      {
        "id": "T1552.003",
        "name": "Shell History",
        "subtechnique": true
      },
      {
        "id": "T1558.002",
        "name": "Silver Ticket",
        "subtechnique": true
      },
      {
        "id": "T1528",
        "name": "Steal Application Access Token",
        "subtechnique": false
      },
      {
        "id": "T1649",
        "name": "Steal or Forge Authentication Certificates",
        "subtechnique": false
      },
      {
        "id": "T1558",
        "name": "Steal or Forge Kerberos Tickets",
        "subtechnique": false
      },
      {
        "id": "T1539",
        "name": "Steal Web Session Cookie",
        "subtechnique": false
      },
      {
        "id": "T1552",
        "name": "Unsecured Credentials",
        "subtechnique": false
      },
      {
        "id": "T1606.001",
        "name": "Web Cookies",
        "subtechnique": true
      },
      {
        "id": "T1056.003",
        "name": "Web Portal Capture",
        "subtechnique": true
      },
      {
        "id": "T1555.004",
        "name": "Windows Credential Manager",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "discovery",
    "name": "Discovery",
    "techniques": [
      {
        "id": "T1087",
        "name": "Account Discovery",
        "subtechnique": false
      },
      {
        "id": "T1010",
        "name": "Application Window Discovery",
        "subtechnique": false
      },
      {
        "id": "T1518.002",
        "name": "Backup Software Discovery",
        "subtechnique": true
      },
      {
        "id": "T1217",
        "name": "Browser Information Discovery",
        "subtechnique": false
      },
      {
        "id": "T1087.004",
        "name": "Cloud Account",
        "subtechnique": true
      },
      {
        "id": "T1069.003",
        "name": "Cloud Groups",
        "subtechnique": true
      },
      {
        "id": "T1580",
        "name": "Cloud Infrastructure Discovery",
        "subtechnique": false
      },
      {
        "id": "T1538",
        "name": "Cloud Service Dashboard",
        "subtechnique": false
      },
      {
        "id": "T1526",
        "name": "Cloud Service Discovery",
        "subtechnique": false
      },
      {
        "id": "T1619",
        "name": "Cloud Storage Object Discovery",
        "subtechnique": false
      },
      {
        "id": "T1613",
        "name": "Container and Resource Discovery",
        "subtechnique": false
      },
      {
        "id": "T1622",
        "name": "Debugger Evasion",
        "subtechnique": false
      },
      {
        "id": "T1652",
        "name": "Device Driver Discovery",
        "subtechnique": false
      },
      {
        "id": "T1087.002",
        "name": "Domain Account",
        "subtechnique": true
      },
      {
        "id": "T1069.002",
        "name": "Domain Groups",
        "subtechnique": true
      },
      {
        "id": "T1482",
        "name": "Domain Trust Discovery",
        "subtechnique": false
      },
      {
        "id": "T1087.003",
        "name": "Email Account",
        "subtechnique": true
      },
      {
        "id": "T1083",
        "name": "File and Directory Discovery",
        "subtechnique": false
      },
      {
        "id": "T1615",
        "name": "Group Policy Discovery",
        "subtechnique": false
      },
      {
        "id": "T1016.001",
        "name": "Internet Connection Discovery",
        "subtechnique": true
      },
      {
        "id": "T1087.001",
        "name": "Local Account",
        "subtechnique": true
      },
      {
        "id": "T1069.001",
        "name": "Local Groups",
        "subtechnique": true
      },
      {
        "id": "T1680",
        "name": "Local Storage Discovery",
        "subtechnique": false
      },
      {
        "id": "T1654",
        "name": "Log Enumeration",
        "subtechnique": false
      },
      {
        "id": "T1046",
        "name": "Network Service Discovery",
        "subtechnique": false
      },
      {
        "id": "T1135",
        "name": "Network Share Discovery",
        "subtechnique": false
      },
      {
        "id": "T1040",
        "name": "Network Sniffing",
        "subtechnique": false
      },
      {
        "id": "T1201",
        "name": "Password Policy Discovery",
        "subtechnique": false
      },
      {
        "id": "T1120",
        "name": "Peripheral Device Discovery",
        "subtechnique": false
      },
      {
        "id": "T1069",
        "name": "Permission Groups Discovery",
        "subtechnique": false
      },
      {
        "id": "T1057",
        "name": "Process Discovery",
        "subtechnique": false
      },
      {
        "id": "T1012",
        "name": "Query Registry",
        "subtechnique": false
      },
      {
        "id": "T1018",
        "name": "Remote System Discovery",
        "subtechnique": false
      },
      {
        "id": "T1518.001",
        "name": "Security Software Discovery",
        "subtechnique": true
      },
      {
        "id": "T1518",
        "name": "Software Discovery",
        "subtechnique": false
      },
      {
        "id": "T1497.001",
        "name": "System Checks",
        "subtechnique": true
      },
      {
        "id": "T1082",
        "name": "System Information Discovery",
        "subtechnique": false
      },
      {
        "id": "T1614.001",
        "name": "System Language Discovery",
        "subtechnique": true
      },
      {
        "id": "T1614",
        "name": "System Location Discovery",
        "subtechnique": false
      },
      {
        "id": "T1016",
        "name": "System Network Configuration Discovery",
        "subtechnique": false
      },
      {
        "id": "T1049",
        "name": "System Network Connections Discovery",
        "subtechnique": false
      },
      {
        "id": "T1033",
        "name": "System Owner/User Discovery",
        "subtechnique": false
      },
      {
        "id": "T1007",
        "name": "System Service Discovery",
        "subtechnique": false
      },
      {
        "id": "T1124",
        "name": "System Time Discovery",
        "subtechnique": false
      },
      {
        "id": "T1497.003",
        "name": "Time Based Checks",
        "subtechnique": true
      },
      {
        "id": "T1497.002",
        "name": "User Activity Based Checks",
        "subtechnique": true
      },
      {
        "id": "T1673",
        "name": "Virtual Machine Discovery",
        "subtechnique": false
      },
      {
        "id": "T1497",
        "name": "Virtualization/Sandbox Evasion",
        "subtechnique": false
      },
      {
        "id": "T1016.002",
        "name": "Wi-Fi Discovery",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "lateral-movement",
    "name": "Lateral Movement",
    "techniques": [
      {
        "id": "T1550.001",
        "name": "Application Access Token",
        "subtechnique": true
      },
      {
        "id": "T1021.007",
        "name": "Cloud Services",
        "subtechnique": true
      },
      {
        "id": "T1021.008",
        "name": "Direct Cloud VM Connections",
        "subtechnique": true
      },
      {
        "id": "T1021.003",
        "name": "Distributed Component Object Model",
        "subtechnique": true
      },
      {
        "id": "T1210",
        "name": "Exploitation of Remote Services",
        "subtechnique": false
      },
      {
        "id": "T1534",
        "name": "Internal Spearphishing",
        "subtechnique": false
      },
      {
        "id": "T1570",
        "name": "Lateral Tool Transfer",
        "subtechnique": false
      },
      {
        "id": "T1550.002",
        "name": "Pass the Hash",
        "subtechnique": true
      },
      {
        "id": "T1550.003",
        "name": "Pass the Ticket",
        "subtechnique": true
      },
      {
        "id": "T1563.002",
        "name": "RDP Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1021.001",
        "name": "Remote Desktop Protocol",
        "subtechnique": true
      },
      {
        "id": "T1563",
        "name": "Remote Service Session Hijacking",
        "subtechnique": false
      },
      {
        "id": "T1021",
        "name": "Remote Services",
        "subtechnique": false
      },
      {
        "id": "T1091",
        "name": "Replication Through Removable Media",
        "subtechnique": false
      },
      {
        "id": "T1021.002",
        "name": "SMB/Windows Admin Shares",
        "subtechnique": true
      },
      {
        "id": "T1072",
        "name": "Software Deployment Tools",
        "subtechnique": false
      },
      {
        "id": "T1021.004",
        "name": "SSH",
        "subtechnique": true
      },
      {
        "id": "T1563.001",
        "name": "SSH Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1080",
        "name": "Taint Shared Content",
        "subtechnique": false
      },
      {
        "id": "T1550",
        "name": "Use Alternate Authentication Material",
        "subtechnique": false
      },
      {
        "id": "T1021.005",
        "name": "VNC",
        "subtechnique": true
      },
      {
        "id": "T1550.004",
        "name": "Web Session Cookie",
        "subtechnique": true
      },
      {
        "id": "T1021.006",
        "name": "Windows Remote Management",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "collection",
    "name": "Collection",
    "techniques": [
      {
        "id": "T1557",
        "name": "Adversary-in-the-Middle",
        "subtechnique": false
      },
      {
        "id": "T1560",
        "name": "Archive Collected Data",
        "subtechnique": false
      },
      {
        "id": "T1560.003",
        "name": "Archive via Custom Method",
        "subtechnique": true
      },
      {
        "id": "T1560.002",
        "name": "Archive via Library",
        "subtechnique": true
      },
      {
        "id": "T1560.001",
        "name": "Archive via Utility",
        "subtechnique": true
      },
      {
        "id": "T1557.002",
        "name": "ARP Cache Poisoning",
        "subtechnique": true
      },
      {
        "id": "T1123",
        "name": "Audio Capture",
        "subtechnique": false
      },
      {
        "id": "T1119",
        "name": "Automated Collection",
        "subtechnique": false
      },
      {
        "id": "T1185",
        "name": "Browser Session Hijacking",
        "subtechnique": false
      },
      {
        "id": "T1115",
        "name": "Clipboard Data",
        "subtechnique": false
      },
      {
        "id": "T1213.003",
        "name": "Code Repositories",
        "subtechnique": true
      },
      {
        "id": "T1213.001",
        "name": "Confluence",
        "subtechnique": true
      },
      {
        "id": "T1056.004",
        "name": "Credential API Hooking",
        "subtechnique": true
      },
      {
        "id": "T1213.004",
        "name": "Customer Relationship Management Software",
        "subtechnique": true
      },
      {
        "id": "T1530",
        "name": "Data from Cloud Storage",
        "subtechnique": false
      },
      {
        "id": "T1602",
        "name": "Data from Configuration Repository",
        "subtechnique": false
      },
      {
        "id": "T1213",
        "name": "Data from Information Repositories",
        "subtechnique": false
      },
      {
        "id": "T1005",
        "name": "Data from Local System",
        "subtechnique": false
      },
      {
        "id": "T1039",
        "name": "Data from Network Shared Drive",
        "subtechnique": false
      },
      {
        "id": "T1025",
        "name": "Data from Removable Media",
        "subtechnique": false
      },
      {
        "id": "T1074",
        "name": "Data Staged",
        "subtechnique": false
      },
      {
        "id": "T1213.006",
        "name": "Databases",
        "subtechnique": true
      },
      {
        "id": "T1557.003",
        "name": "DHCP Spoofing",
        "subtechnique": true
      },
      {
        "id": "T1114",
        "name": "Email Collection",
        "subtechnique": false
      },
      {
        "id": "T1114.003",
        "name": "Email Forwarding Rule",
        "subtechnique": true
      },
      {
        "id": "T1557.004",
        "name": "Evil Twin",
        "subtechnique": true
      },
      {
        "id": "T1056.002",
        "name": "GUI Input Capture",
        "subtechnique": true
      },
      {
        "id": "T1056",
        "name": "Input Capture",
        "subtechnique": false
      },
      {
        "id": "T1056.001",
        "name": "Keylogging",
        "subtechnique": true
      },
      {
        "id": "T1074.001",
        "name": "Local Data Staging",
        "subtechnique": true
      },
      {
        "id": "T1114.001",
        "name": "Local Email Collection",
        "subtechnique": true
      },
      {
        "id": "T1213.005",
        "name": "Messaging Applications",
        "subtechnique": true
      },
      {
        "id": "T1557.001",
        "name": "Name Resolution Poisoning and SMB Relay",
        "subtechnique": true
      },
      {
        "id": "T1602.002",
        "name": "Network Device Configuration Dump",
        "subtechnique": true
      },
      {
        "id": "T1074.002",
        "name": "Remote Data Staging",
        "subtechnique": true
      },
      {
        "id": "T1114.002",
        "name": "Remote Email Collection",
        "subtechnique": true
      },
      {
        "id": "T1113",
        "name": "Screen Capture",
        "subtechnique": false
      },
      {
        "id": "T1213.002",
        "name": "Sharepoint",
        "subtechnique": true
      },
      {
        "id": "T1602.001",
        "name": "SNMP (MIB Dump)",
        "subtechnique": true
      },
      {
        "id": "T1125",
        "name": "Video Capture",
        "subtechnique": false
      },
      {
        "id": "T1056.003",
        "name": "Web Portal Capture",
        "subtechnique": true
      }
    ]
  },
  {
    "id": "command-and-control",
    "name": "Command and Control",
    "techniques": [
      {
        "id": "T1071",
        "name": "Application Layer Protocol",
        "subtechnique": false
      },
      {
        "id": "T1573.002",
        "name": "Asymmetric Cryptography",
        "subtechnique": true
      },
      {
        "id": "T1102.002",
        "name": "Bidirectional Communication",
        "subtechnique": true
      },
      {
        "id": "T1092",
        "name": "Communication Through Removable Media",
        "subtechnique": false
      },
      {
        "id": "T1659",
        "name": "Content Injection",
        "subtechnique": false
      },
      {
        "id": "T1132",
        "name": "Data Encoding",
        "subtechnique": false
      },
      {
        "id": "T1001",
        "name": "Data Obfuscation",
        "subtechnique": false
      },
      {
        "id": "T1102.001",
        "name": "Dead Drop Resolver",
        "subtechnique": true
      },
      {
        "id": "T1071.004",
        "name": "DNS",
        "subtechnique": true
      },
      {
        "id": "T1568.003",
        "name": "DNS Calculation",
        "subtechnique": true
      },
      {
        "id": "T1090.004",
        "name": "Domain Fronting",
        "subtechnique": true
      },
      {
        "id": "T1568.002",
        "name": "Domain Generation Algorithms",
        "subtechnique": true
      },
      {
        "id": "T1568",
        "name": "Dynamic Resolution",
        "subtechnique": false
      },
      {
        "id": "T1573",
        "name": "Encrypted Channel",
        "subtechnique": false
      },
      {
        "id": "T1090.002",
        "name": "External Proxy",
        "subtechnique": true
      },
      {
        "id": "T1008",
        "name": "Fallback Channels",
        "subtechnique": false
      },
      {
        "id": "T1568.001",
        "name": "Fast Flux DNS",
        "subtechnique": true
      },
      {
        "id": "T1071.002",
        "name": "File Transfer Protocols",
        "subtechnique": true
      },
      {
        "id": "T1665",
        "name": "Hide Infrastructure",
        "subtechnique": false
      },
      {
        "id": "T1219.001",
        "name": "IDE Tunneling",
        "subtechnique": true
      },
      {
        "id": "T1105",
        "name": "Ingress Tool Transfer",
        "subtechnique": false
      },
      {
        "id": "T1090.001",
        "name": "Internal Proxy",
        "subtechnique": true
      },
      {
        "id": "T1001.001",
        "name": "Junk Data",
        "subtechnique": true
      },
      {
        "id": "T1071.003",
        "name": "Mail Protocols",
        "subtechnique": true
      },
      {
        "id": "T1090.003",
        "name": "Multi-hop Proxy",
        "subtechnique": true
      },
      {
        "id": "T1104",
        "name": "Multi-Stage Channels",
        "subtechnique": false
      },
      {
        "id": "T1095",
        "name": "Non-Application Layer Protocol",
        "subtechnique": false
      },
      {
        "id": "T1132.002",
        "name": "Non-Standard Encoding",
        "subtechnique": true
      },
      {
        "id": "T1571",
        "name": "Non-Standard Port",
        "subtechnique": false
      },
      {
        "id": "T1102.003",
        "name": "One-Way Communication",
        "subtechnique": true
      },
      {
        "id": "T1205.001",
        "name": "Port Knocking",
        "subtechnique": true
      },
      {
        "id": "T1001.003",
        "name": "Protocol or Service Impersonation",
        "subtechnique": true
      },
      {
        "id": "T1572",
        "name": "Protocol Tunneling",
        "subtechnique": false
      },
      {
        "id": "T1090",
        "name": "Proxy",
        "subtechnique": false
      },
      {
        "id": "T1071.005",
        "name": "Publish/Subscribe Protocols",
        "subtechnique": true
      },
      {
        "id": "T1219.003",
        "name": "Remote Access Hardware",
        "subtechnique": true
      },
      {
        "id": "T1219",
        "name": "Remote Access Tools",
        "subtechnique": false
      },
      {
        "id": "T1219.002",
        "name": "Remote Desktop Software",
        "subtechnique": true
      },
      {
        "id": "T1205.002",
        "name": "Socket Filters",
        "subtechnique": true
      },
      {
        "id": "T1132.001",
        "name": "Standard Encoding",
        "subtechnique": true
      },
      {
        "id": "T1001.002",
        "name": "Steganography",
        "subtechnique": true
      },
      {
        "id": "T1573.001",
        "name": "Symmetric Cryptography",
        "subtechnique": true
      },
      {
        "id": "T1205",
        "name": "Traffic Signaling",
        "subtechnique": false
      },
      {
        "id": "T1071.001",
        "name": "Web Protocols",
        "subtechnique": true
      },
      {
        "id": "T1102",
        "name": "Web Service",
        "subtechnique": false
      }
    ]
  },
  {
    "id": "exfiltration",
    "name": "Exfiltration",
    "techniques": [
      {
        "id": "T1020",
        "name": "Automated Exfiltration",
        "subtechnique": false
      },
      {
        "id": "T1030",
        "name": "Data Transfer Size Limits",
        "subtechnique": false
      },
      {
        "id": "T1048",
        "name": "Exfiltration Over Alternative Protocol",
        "subtechnique": false
      },
      {
        "id": "T1048.002",
        "name": "Exfiltration Over Asymmetric Encrypted Non-C2 Protocol",
        "subtechnique": true
      },
      {
        "id": "T1011.001",
        "name": "Exfiltration Over Bluetooth",
        "subtechnique": true
      },
      {
        "id": "T1041",
        "name": "Exfiltration Over C2 Channel",
        "subtechnique": false
      },
      {
        "id": "T1011",
        "name": "Exfiltration Over Other Network Medium",
        "subtechnique": false
      },
      {
        "id": "T1052",
        "name": "Exfiltration Over Physical Medium",
        "subtechnique": false
      },
      {
        "id": "T1048.001",
        "name": "Exfiltration Over Symmetric Encrypted Non-C2 Protocol",
        "subtechnique": true
      },
      {
        "id": "T1048.003",
        "name": "Exfiltration Over Unencrypted Non-C2 Protocol",
        "subtechnique": true
      },
      {
        "id": "T1052.001",
        "name": "Exfiltration over USB",
        "subtechnique": true
      },
      {
        "id": "T1567",
        "name": "Exfiltration Over Web Service",
        "subtechnique": false
      },
      {
        "id": "T1567.004",
        "name": "Exfiltration Over Webhook",
        "subtechnique": true
      },
      {
        "id": "T1567.002",
        "name": "Exfiltration to Cloud Storage",
        "subtechnique": true
      },
      {
        "id": "T1567.001",
        "name": "Exfiltration to Code Repository",
        "subtechnique": true
      },
      {
        "id": "T1567.003",
        "name": "Exfiltration to Text Storage Sites",
        "subtechnique": true
      },
      {
        "id": "T1029",
        "name": "Scheduled Transfer",
        "subtechnique": false
      },
      {
        "id": "T1020.001",
        "name": "Traffic Duplication",
        "subtechnique": true
      },
      {
        "id": "T1537",
        "name": "Transfer Data to Cloud Account",
        "subtechnique": false
      }
    ]
  },
  {
    "id": "impact",
    "name": "Impact",
    "techniques": [
      {
        "id": "T1531",
        "name": "Account Access Removal",
        "subtechnique": false
      },
      {
        "id": "T1499.003",
        "name": "Application Exhaustion Flood",
        "subtechnique": true
      },
      {
        "id": "T1499.004",
        "name": "Application or System Exploitation",
        "subtechnique": true
      },
      {
        "id": "T1496.002",
        "name": "Bandwidth Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1496.004",
        "name": "Cloud Service Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1496.001",
        "name": "Compute Hijacking",
        "subtechnique": true
      },
      {
        "id": "T1485",
        "name": "Data Destruction",
        "subtechnique": false
      },
      {
        "id": "T1486",
        "name": "Data Encrypted for Impact",
        "subtechnique": false
      },
      {
        "id": "T1565",
        "name": "Data Manipulation",
        "subtechnique": false
      },
      {
        "id": "T1491",
        "name": "Defacement",
        "subtechnique": false
      },
      {
        "id": "T1498.001",
        "name": "Direct Network Flood",
        "subtechnique": true
      },
      {
        "id": "T1561.001",
        "name": "Disk Content Wipe",
        "subtechnique": true
      },
      {
        "id": "T1561.002",
        "name": "Disk Structure Wipe",
        "subtechnique": true
      },
      {
        "id": "T1561",
        "name": "Disk Wipe",
        "subtechnique": false
      },
      {
        "id": "T1667",
        "name": "Email Bombing",
        "subtechnique": false
      },
      {
        "id": "T1499",
        "name": "Endpoint Denial of Service",
        "subtechnique": false
      },
      {
        "id": "T1491.002",
        "name": "External Defacement",
        "subtechnique": true
      },
      {
        "id": "T1657",
        "name": "Financial Theft",
        "subtechnique": false
      },
      {
        "id": "T1495",
        "name": "Firmware Corruption",
        "subtechnique": false
      },
      {
        "id": "T1490",
        "name": "Inhibit System Recovery",
        "subtechnique": false
      },
      {
        "id": "T1491.001",
        "name": "Internal Defacement",
        "subtechnique": true
      },
      {
        "id": "T1485.001",
        "name": "Lifecycle-Triggered Deletion",
        "subtechnique": true
      },
      {
        "id": "T1498",
        "name": "Network Denial of Service",
        "subtechnique": false
      },
      {
        "id": "T1499.001",
        "name": "OS Exhaustion Flood",
        "subtechnique": true
      },
      {
        "id": "T1498.002",
        "name": "Reflection Amplification",
        "subtechnique": true
      },
      {
        "id": "T1496",
        "name": "Resource Hijacking",
        "subtechnique": false
      },
      {
        "id": "T1565.003",
        "name": "Runtime Data Manipulation",
        "subtechnique": true
      },
      {
        "id": "T1499.002",
        "name": "Service Exhaustion Flood",
        "subtechnique": true
      },
      {
        "id": "T1489",
        "name": "Service Stop",
        "subtechnique": false
      },
      {
        "id": "T1496.003",
        "name": "SMS Pumping",
        "subtechnique": true
      },
      {
        "id": "T1565.001",
        "name": "Stored Data Manipulation",
        "subtechnique": true
      },
      {
        "id": "T1529",
        "name": "System Shutdown/Reboot",
        "subtechnique": false
      },
      {
        "id": "T1565.002",
        "name": "Transmitted Data Manipulation",
        "subtechnique": true
      }
    ]
  }
]
