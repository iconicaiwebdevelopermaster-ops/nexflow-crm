const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const templates = [
  {
    name: "No Website Pitch",
    category: "Cold Outreach",
    subject: "Quick question about {{company}} online presence",
    body: "Hi {{name}}, I noticed {{company}} does not have an active website yet. In today's market, having no online presence means losing potential customers daily to competitors. At NexPulseLabs, we build high-converting, lightning-fast modern websites for businesses like yours. Would you be open to a quick 5-minute call this week? Best regards, NexPulseLabs Team - nexpulselabs.com"
  },
  {
    name: "Weak Outdated Website",
    category: "Cold Outreach",
    subject: "Saw {{company}} website - had a quick thought",
    body: "Hi {{name}}, I came across {{company}} website and noticed a few design and speed bottlenecks that might be hurting your customer conversion rate. We specialize in redesigning modern, responsive web apps that turn visitors into paying customers. Would you like a free 3-point audit? Best, NexPulseLabs Team - nexpulselabs.com"
  },
  {
    name: "Not Mobile Friendly",
    category: "Cold Outreach",
    subject: "{{company}} website on mobile devices",
    body: "Hi {{name}}, I checked {{company}} site on mobile and noticed some layout issues. Over 60 percent of searches happen on smartphones today, and visitors leave instantly if a site is not optimized for mobile. We help brands build seamless mobile-first experiences. Can I send over a quick preview? Best regards, NexPulseLabs Team - nexpulselabs.com"
  },
  {
    name: "Slow Loading Website",
    category: "Performance",
    subject: "{{company}} website speed issue",
    body: "Hi {{name}}, I ran a quick performance test on {{company}} website and found it takes several seconds to load. Studies show that a 1-second delay reduces conversions by 7 percent. We build websites on Next.js that load in under 1 second. Let me know if you would like our speed optimization recommendations. Best, NexPulseLabs Team - nexpulselabs.com"
  },
  {
    name: "Follow-up",
    category: "Follow-up",
    subject: "Following up - {{company}} digital presence",
    body: "Hi {{name}}, I sent you a quick note last week regarding {{company}} online presence. Just wanted to follow up and see if this is something on your radar this quarter. Happy to hop on a quick 5-minute chat whenever suits you best. Best regards, NexPulseLabs Team - nexpulselabs.com"
  }
];

async function main() {
  console.log("Seeding templates...");
  for (const t of templates) {
    await prisma.template.create({ data: t });
  }
  console.log("5 Default Templates seeded successfully!");
}

main()
  .catch(function(e) { console.error(e); process.exit(1); })
  .finally(function() { prisma.$disconnect(); });