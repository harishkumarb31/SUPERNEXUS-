import { prisma } from './db';
import { config } from '../config';

export interface RagCitation {
  documentTitle: string;
  chapter: string;
  section: string;
  pageRef: string;
  excerpt: string;
}

export interface AssistantResponse {
  answer: string;
  citations: RagCitation[];
  grounded: boolean;
  confidence: number;
}

export class RagService {
  /**
   * Search regulatory corpus and generate grounded answer with citations
   */
  static async queryRegulatoryAssistant(
    question: string,
    userRole: string,
    institutionId?: string | null
  ): Promise<AssistantResponse> {
    const references = await prisma.regulatoryReference.findMany();

    // 1. Chunk matching and scoring
    const matchingChunks: Array<{
      ref: any;
      section: string;
      text: string;
      pageRef: string;
      score: number;
    }> = [];

    const queryTokens = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    for (const ref of references) {
      try {
        const chunks = JSON.parse(ref.contentChunksJson) as Array<{
          section: string;
          text: string;
          pageRef: string;
        }>;

        for (const chunk of chunks) {
          const chunkText = `${ref.title} ${chunk.section} ${chunk.text}`.toLowerCase();
          let score = 0;

          for (const token of queryTokens) {
            if (chunkText.includes(token)) {
              score += token.length > 3 ? 3 : 1;
            }
          }

          if (score > 0) {
            matchingChunks.push({
              ref,
              section: chunk.section,
              text: chunk.text,
              pageRef: chunk.pageRef,
              score,
            });
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }

    matchingChunks.sort((a, b) => b.score - a.score);
    const topChunks = matchingChunks.slice(0, 3);

    const citations: RagCitation[] = topChunks.map((c) => ({
      documentTitle: c.ref.title,
      chapter: c.ref.chapter,
      section: c.section,
      pageRef: c.pageRef,
      excerpt: c.text,
    }));

    // 2. Answer generation
    if (topChunks.length === 0) {
      return {
        answer: `I could not find verified clauses in the AICTE Approval Process Handbook (2024-2027) covering "${question}". As per regulatory protocol, official AICTE guidelines must be consulted directly or submitted through the regional grievance portal.`,
        citations: [],
        grounded: false,
        confidence: 0.2,
      };
    }

    // Check if Groq API key is provided and valid
    if (config.groqApiKey && config.groqApiKey.startsWith('gsk_')) {
      try {
        const contextString = topChunks
          .map((c) => `[Source: ${c.ref.title} | ${c.section} | ${c.pageRef}]\n${c.text}`)
          .join('\n\n');

        const systemPrompt = `You are the RegulaFlow AI Regulatory Assistant, specialized in the official AICTE Approval Process Handbook (APH 2024-2027). Answer the user's question strictly using the provided regulatory context. Include chapter and clause citations. Never fabricate regulatory requirements, approvals or statistics.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.groqApiKey}`,
          },
          body: JSON.stringify({
            model: config.aiModel || 'llama-3.1-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Context:\n${contextString}\n\nQuestion: ${question}` },
            ],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const text = data.choices[0]?.message?.content;
          if (text) {
            return {
              answer: text,
              citations,
              grounded: true,
              confidence: 0.95,
            };
          }
        }
      } catch (apiErr) {
        console.warn('[Groq API Fallback]: Falling back to local grounded generator', apiErr);
      }
    }

    // 3. Local Grounded Deterministic Generator
    const primary = topChunks[0];
    const secondary = topChunks[1];

    let synthesizedAnswer = `According to the **AICTE Approval Process Handbook (${primary.ref.effectiveYear || '2026-2027'})**, specifically under **${primary.section}** (${primary.pageRef}):\n\n`;
    synthesizedAnswer += `> "${primary.text}"\n\n`;

    if (secondary) {
      synthesizedAnswer += `Furthermore, as detailed in **${secondary.section}** (${secondary.pageRef}):\n\n`;
      synthesizedAnswer += `> "${secondary.text}"\n\n`;
    }

    synthesizedAnswer += `**Regulatory Advice for Scrutiny:** All documentation submitted must be verified against these statutory norms. Failure to meet these thresholds will result in automated deficiency flagging under AICTE inspection rules.`;

    return {
      answer: synthesizedAnswer,
      citations,
      grounded: true,
      confidence: 0.92,
    };
  }
}

