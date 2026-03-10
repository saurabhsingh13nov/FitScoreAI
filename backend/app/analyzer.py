import json
import io

import anthropic
import pdfplumber

from app.schemas import AnalysisResponse, Metric

ANALYSIS_TOOL = {
    "name": "submit_analysis",
    "description": "Submit the resume-to-JD fit analysis with scored metrics.",
    "input_schema": {
        "type": "object",
        "properties": {
            "metrics": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Metric name, e.g. 'Technical Skills Match'",
                        },
                        "score": {
                            "type": "number",
                            "description": "Score from 1-10",
                        },
                        "weight": {
                            "type": "number",
                            "description": "Importance weight (all weights must sum to 1.0)",
                        },
                        "summary": {
                            "type": "string",
                            "description": "One-sentence summary of the assessment",
                        },
                        "details": {
                            "type": "string",
                            "description": "Detailed explanation of the score (2-4 sentences)",
                        },
                        "improvements": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "2-4 actionable improvement suggestions",
                        },
                    },
                    "required": [
                        "name",
                        "score",
                        "weight",
                        "summary",
                        "details",
                        "improvements",
                    ],
                },
                "description": "5-10 metrics most relevant to this specific job",
            },
        },
        "required": ["metrics"],
    },
}

SYSTEM_PROMPT = """You are an expert resume analyst and career coach. You analyze how well a resume matches a job description.

Your task:
1. Read the resume and job description carefully.
2. Identify 5-10 metrics most relevant to THIS specific job (e.g., Technical Skills Match, Experience Level, Leadership, Domain Expertise, Education Fit, etc.). Choose metrics that matter for this role — don't use a generic fixed list.
3. Score each metric from 1 to 10.
4. Assign a weight to each metric reflecting its importance for this role. Weights MUST sum to 1.0.
5. For each metric, provide a one-sentence summary, a detailed 2-4 sentence explanation, and 2-4 actionable improvement suggestions.
6. Use the submit_analysis tool to return your results.

Be honest and constructive. Focus on actionable, specific feedback."""


def extract_pdf_text(pdf_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    text = "\n\n".join(pages).strip()
    if not text:
        raise ValueError("Could not extract text from the PDF. Is it a scanned image?")
    return text


async def analyze_resume(resume_text: str, job_description: str) -> AnalysisResponse:
    client = anthropic.AsyncAnthropic()

    message = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        tools=[ANALYSIS_TOOL],
        tool_choice={"type": "tool", "name": "submit_analysis"},
        messages=[
            {
                "role": "user",
                "content": f"## Resume\n\n{resume_text}\n\n## Job Description\n\n{job_description}",
            }
        ],
    )

    # Extract the tool use result
    for block in message.content:
        if block.type == "tool_use" and block.name == "submit_analysis":
            metrics_data = block.input["metrics"]
            break
    else:
        raise RuntimeError("Claude did not return the expected tool call")

    metrics = [Metric(**m) for m in metrics_data]

    # Compute weighted overall score
    overall_score = round(sum(m.score * m.weight for m in metrics), 1)

    return AnalysisResponse(overall_score=overall_score, metrics=metrics)
