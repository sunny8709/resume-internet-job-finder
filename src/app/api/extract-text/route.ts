import { NextRequest, NextResponse } from "next/server"
import { PDFExtract } from "pdf.js-extract"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)
    
    let text = ""
    const fileType = file.type.toLowerCase()

    if (fileType === "application/pdf") {
      // Extract text from PDF using pdf.js-extract
      const pdfExtract = new PDFExtract()
      const data = await pdfExtract.extractBuffer(buffer)
      
      // Combine text from all pages
      text = data.pages
        .map(page => page.content.map(item => item.str).join(" "))
        .join("\n")
    } else if (fileType === "text/plain") {
      // Plain text file
      text = buffer.toString("utf-8")
    } else {
      // For DOC/DOCX files, try to extract text (best effort)
      text = buffer.toString("utf-8")
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content found in the file" },
        { status: 400 }
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error extracting text:", error)
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    )
  }
}