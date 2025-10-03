import { NextRequest, NextResponse } from "next/server"
import pdfParse from "pdf-parse"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    let text = ""

    // Handle PDF files
    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const data = await pdfParse(buffer)
        text = data.text
      } catch (error) {
        console.error("PDF parsing error:", error)
        return NextResponse.json(
          { error: "Failed to extract text from PDF" },
          { status: 500 }
        )
      }
    }
    // Handle text files
    else if (file.type === "text/plain") {
      text = await file.text()
    }
    // Handle DOC/DOCX and other text-based formats
    else {
      text = await file.text()
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error extracting text:", error)
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    )
  }
}