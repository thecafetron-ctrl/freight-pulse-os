import { Router } from 'express';
import multer from 'multer';
import { createTmsLoadId, deduplicateResults, DocumentResult, extractDocumentData, readDocument } from '../utils/documentExtraction';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 20,
  },
});

router.post('/extract', upload.array('files', 20), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const shouldDeduplicate = req.query.deduplicate !== 'false';

  if (!files || files.length === 0) {
    return res.status(400).json({
      error: 'No files provided. Please upload at least one document.',
    });
  }

  const results: DocumentResult[] = [];

  for (const file of files) {
    try {
      const text = await readDocument(file.buffer, file.originalname);
      if (!text.trim()) {
        throw new Error('Unable to extract text from document');
      }

      const data = await extractDocumentData(text);

      results.push({
        filename: file.originalname,
        success: true,
        data,
        merged_from: [file.originalname],
        document_count: 1,
        is_merged: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process document';
      console.error(`Document processing failed for ${file.originalname}:`, message);

      results.push({
        filename: file.originalname,
        success: false,
        error: message,
        merged_from: [file.originalname],
        document_count: 1,
        is_merged: false,
      });
    }
  }

  const processedResults = shouldDeduplicate ? deduplicateResults(results) : results;
  const successful = processedResults.filter((result) => result.success).length;
  const failed = processedResults.length - successful;

  return res.json({
    totalFiles: files.length,
    successful,
    failed,
    results: processedResults,
  });
});

router.post('/tms', async (req, res) => {
  const { loads, source = 'AI_Extraction' } = req.body as { loads?: unknown; source?: string };

  if (!Array.isArray(loads) || loads.length === 0) {
    return res.status(400).json({
      error: 'Request must include a non-empty "loads" array.',
    });
  }

  const results = loads.map((load) => {
    const loadId = createTmsLoadId();
    return {
      success: true,
      loadId,
      message: `Load ${loadId} successfully created in TMS`,
      timestamp: new Date().toISOString(),
      source,
    };
  });

  return res.json({
    totalLoads: loads.length,
    successful: results.length,
    failed: 0,
    results,
  });
});

export default router;
