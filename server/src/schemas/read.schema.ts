import { file, z } from "zod"

export const readDocSectionInputSchema = z.object({
  filePath: z.string(),
  section: z.string().optional()
})

export const readDocSectionOutputSchema = z.object({
  content: z.string(),
  filePath: z.string(),
  section: z.string().nullable()
})

export type readDocSectionInputType = z.infer<typeof readDocSectionInputSchema>
export type readDocSectionOutputType = z.infer<typeof readDocSectionOutputSchema>
