import { NextRequest, NextResponse } from "next/server"
import PDFParser from "pdf2json"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size)

    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)
    
    let text = ""
    const fileType = file.type.toLowerCase()

    try {
      if (fileType === "application/pdf") {
        // Extract text from PDF using pdf2json
        console.log("Extracting text from PDF with pdf2json...")
        text = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser()
          
          pdfParser.on("pdfParser_dataError", (errData: Error) => {
            reject(errData)
          })
          
          pdfParser.on("pdfParser_dataReady", (pdfData) => {
            try {
              const rawText = pdfParser.getRawTextContent()
              resolve(rawText)
            } catch (err) {
              reject(err)
            }
          })
          
          pdfParser.parseBuffer(buffer)
        })
        console.log("Extracted text length:", text?.length || 0)
      } else if (fileType === "text/plain") {
        // Plain text file
        console.log("Reading plain text file...")
        text = buffer.toString("utf-8")
      } else {
        // For DOC/DOCX files, try to extract text (best effort)
        console.log("Attempting to read as text...")
        text = buffer.toString("utf-8")
      }
    } catch (extractError) {
      console.error("Extraction error details:", extractError)
      return NextResponse.json(
        { error: `Failed to parse file: ${extractError instanceof Error ? extractError.message : String(extractError)}` },
        { status: 500 }
      )
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content found in the file" },
        { status: 400 }
      )
    }

    console.log("Successfully extracted text, length:", text.length)
    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error extracting text:", error)
    return NextResponse.json(
      { error: `Failed to extract text: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}