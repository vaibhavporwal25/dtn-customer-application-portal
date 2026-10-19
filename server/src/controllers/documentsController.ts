import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { execute, queryOne, query } from '../db/database.js';
import { DocumentRecord } from '../types/index.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

function isAuthorizedForDocument(req: Request, doc: DocumentRecord): boolean {
  // Allow draft unlinked documents to be accessed by the client in active session
  if (doc.application_id === 0) {
    return true;
  }
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : queryToken;
  if (!token) return false;
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'dtn_india_secure_jwt_token_secret_key_demo_2026_change_in_production';
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file was uploaded' });
      return;
    }

    const { documentType, docLabel, applicationId } = req.body;
    const originalFilename = req.file.originalname;
    const storedFilename = req.file.filename;
    const mimeType = req.file.mimetype;
    const fileSize = req.file.size;
    const filePath = req.file.path;
    const now = new Date().toISOString();

    const appId = applicationId ? parseInt(applicationId, 10) : 0;

    const result = await execute(`
      INSERT INTO documents (
        application_id, document_type, doc_label, original_filename,
        stored_filename, mime_type, file_size, file_path, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      appId,
      documentType || 'general',
      docLabel || 'Supporting Document',
      originalFilename,
      storedFilename,
      mimeType,
      fileSize,
      filePath,
      now
    ]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: result.lastInsertRowId,
        documentType: documentType || 'general',
        docLabel: docLabel || 'Supporting Document',
        originalFilename,
        storedFilename,
        mimeType,
        fileSize,
        uploadedAt: now
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getDocumentPreview(req: Request, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid document ID' }); return; }
    const doc = await queryOne<DocumentRecord>('SELECT * FROM documents WHERE id = ?', [id]);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    if (!isAuthorizedForDocument(req, doc)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have authorization to view documents attached to an active submitted application.'
      });
      return;
    }

    const fullPath = path.resolve(doc.file_path);
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ success: false, message: 'Document file not found on disk' });
      return;
    }

    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function downloadDocument(req: Request, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid document ID' }); return; }
    const doc = await queryOne<DocumentRecord>('SELECT * FROM documents WHERE id = ?', [id]);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    if (!isAuthorizedForDocument(req, doc)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have authorization to download documents attached to an active submitted application.'
      });
      return;
    }

    const fullPath = path.resolve(doc.file_path);
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ success: false, message: 'Document file not found on disk' });
      return;
    }

    res.download(fullPath, doc.original_filename);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function deleteDocument(req: Request, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid document ID' }); return; }
    const doc = await queryOne<DocumentRecord>('SELECT * FROM documents WHERE id = ?', [id]);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    if (!isAuthorizedForDocument(req, doc)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Deleting documents from an active submitted application requires administrator authentication.'
      });
      return;
    }

    if (fs.existsSync(doc.file_path)) {
      try { fs.unlinkSync(doc.file_path); } catch {}
    }

    await execute('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
