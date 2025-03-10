import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { HttpResponseOutputParser } from 'langchain/output_parsers'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const REVIEW_TEMPLATE = `You are a database design expert. Please analyze the following database schema changes and provide a detailed review.

Include the following points in your review:
1. Overall evaluation of the changes
2. Issues with table design (normalization, naming conventions, etc.)
3. Evaluation and recommendations for index design
4. Performance concerns
5. Security concerns
6. Specific suggestions for improvement

Schema Changes:
"""
{schema_changes}
"""

Please output the review results in Markdown format in English.`

async function fetchSchemaChanges(prUrl: string) {
  try {
    const prApiUrl = prUrl.replace('github.com', 'api.github.com/repos').replace('/pull/', '/pulls/')
    const response = await fetch(`${prApiUrl}/files`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })


    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`)
    }

    const files = await response.json()
    const schemaFile = files.find((file: { filename: string | string[] }) =>
      file.filename.includes('Schemafile') || file.filename.includes('schema.rb')
    )

    return schemaFile ? schemaFile.patch : null
  } catch (error) {
    console.error('Error fetching PR data:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prUrl } = await req.json()

    if (!prUrl || typeof prUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Pull Request URL is not provided or is invalid' }),
        { status: 400 },
      )
    }

    const schemaChanges = await fetchSchemaChanges(prUrl)

    if (!schemaChanges) {
      return new Response(
        JSON.stringify({ error: 'No Schemafile changes found in the PR' }),
        { status: 400 },
      )
    }

    const prompt = PromptTemplate.fromTemplate(REVIEW_TEMPLATE)
    const model = new ChatOpenAI({ temperature: 0.7, model: 'gpt-4o-mini' })
    const outputParser = new HttpResponseOutputParser()
    const chain = prompt.pipe(model).pipe(outputParser)

    const stream = await chain.stream({ schema_changes: schemaChanges })

    return new Response(stream)
  } catch (error) {
    console.error('Error in review API:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred while reviewing the schema changes' }),
      { status: 500 },
    )
  }
}
