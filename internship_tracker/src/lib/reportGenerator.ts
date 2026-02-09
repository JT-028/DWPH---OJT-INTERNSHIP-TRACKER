import type { ReportData } from "@/types"
import { format } from "date-fns"

export const generateCSV = (data: ReportData): string => {
    const headers = ["Date", "Hours Worked", "Status", "Tasks"]

    const rows = data.logs.map((log) => [
        format(new Date(log.date), "yyyy-MM-dd"),
        log.hoursWorked.toString(),
        log.status,
        `"${(log.tasks || "").replace(/"/g, '""')}"`,
    ])

    const csv = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
    ].join("\n")

    return csv
}

export const downloadCSV = (data: ReportData, filename: string = "internship-report"): void => {
    const csv = generateCSV(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export const generatePDFContent = (data: ReportData): string => {
    // Generate HTML content that can be printed as PDF
    const { settings, logs, summary } = data

    const logsHTML = logs.map((log) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${format(new Date(log.date), "MMM dd, yyyy")}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${log.hoursWorked}h</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${log.status}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${log.tasks || "-"}</td>
    </tr>
  `).join("")

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Internship Progress Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #7C3AED; text-align: center; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .stat { flex: 1; background: #f5f3ff; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #7C3AED; }
        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #7C3AED; color: white; padding: 12px 8px; text-align: left; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>🎓 Internship Progress Report</h1>
      
      <div class="summary">
        <div class="stat">
          <div class="stat-value">${summary.totalHoursCompleted}h</div>
          <div class="stat-label">Hours Completed</div>
        </div>
        <div class="stat">
          <div class="stat-value">${settings.targetHours}h</div>
          <div class="stat-label">Target Hours</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Math.round(summary.progressPercentage)}%</div>
          <div class="stat-label">Progress</div>
        </div>
        <div class="stat">
          <div class="stat-value">${summary.remainingHours}h</div>
          <div class="stat-label">Remaining</div>
        </div>
      </div>

      <h2>Daily Logs</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Hours</th>
            <th>Status</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          ${logsHTML || '<tr><td colspan="4" style="text-align: center; padding: 20px;">No logs recorded yet</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}
      </div>
    </body>
    </html>
  `
}

export const downloadPDF = (data: ReportData): void => {
    const content = generatePDFContent(data)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
        printWindow.document.write(content)
        printWindow.document.close()
        printWindow.onload = () => {
            printWindow.print()
        }
    }
}
