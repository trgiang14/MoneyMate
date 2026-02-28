import { processRecurringTransactions } from "@/actions/recurring-transactions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Kiểm tra CRON_SECRET để bảo mật (nếu có)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const results = await processRecurringTransactions();
    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}
