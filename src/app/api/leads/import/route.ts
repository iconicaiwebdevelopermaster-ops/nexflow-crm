import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { csvData, source } = await req.json();

    if (!csvData || typeof csvData !== "string") {
      return NextResponse.json({ success: false, error: "Invalid CSV data provided." }, { status: 400 });
    }

    const rows = csvData.split(/\r?\n/).filter(row => row.trim() !== "");
    if (rows.length < 2) {
      return NextResponse.json({ success: false, error: "CSV file is empty or missing data rows." }, { status: 400 });
    }

    const headers = rows[0].split(",").map(h => h.trim().toLowerCase().replace(/["']/g, ""));
    
    const nameIdx = headers.findIndex(h => h.includes("name"));
    const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
    const companyIdx = headers.findIndex(h => h.includes("company") || h.includes("business") || h.includes("firm"));
    const websiteIdx = headers.findIndex(h => h.includes("website") || h.includes("site") || h.includes("url"));
    const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("tel") || h.includes("contact"));
    const notesIdx = headers.findIndex(h => h.includes("notes") || h.includes("description") || h.includes("info"));

    if (nameIdx === -1 || emailIdx === -1) {
      return NextResponse.json({
        success: false,
        error: "CSV must contain at least 'Name' and 'Email' columns."
      }, { status: 400 });
    }

    const leadsToInsert = [];

    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ""));
      
      if (columns.length <= Math.max(nameIdx, emailIdx)) continue;

      const name = columns[nameIdx];
      const email = columns[emailIdx];

      if (!name || !email || !email.includes("@")) continue;

      const company = companyIdx !== -1 ? columns[companyIdx] || null : null;
      const website = websiteIdx !== -1 ? columns[websiteIdx] || null : null;
      const phone = phoneIdx !== -1 ? columns[phoneIdx] || null : null;
      const notes = notesIdx !== -1 ? columns[notesIdx] || null : null;

      leadsToInsert.push({
        userId: session.user.id,
        name,
        email: email.toLowerCase(),
        company,
        website,
        phone,
        source: source || "CSV Import",
        notes,
        status: "NEW" as LeadStatus,
      });
    }

    if (leadsToInsert.length === 0) {
      return NextResponse.json({ success: false, error: "No valid rows found to import." }, { status: 400 });
    }

    const result = await prisma.lead.createMany({
      data: leadsToInsert,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully imported ${result.count} new leads!`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}