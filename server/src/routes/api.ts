import { Router } from 'express';
import { getPlans, getPlanById } from '../controllers/plansController.js';
import { uploadDocument, getDocumentPreview, downloadDocument, deleteDocument } from '../controllers/documentsController.js';
import { submitApplication, getApplicationPublicDetails } from '../controllers/applicationsController.js';
import { initiatePayment, processSimulatedPayment } from '../controllers/paymentsController.js';
import {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getApplicationsList,
  getApplicationDetails,
  updateApplicationStatus,
  exportApplicationsToExcel
} from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { multerUpload, validateFileSignatures } from '../middleware/upload.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'DTN India Customer Application Portal API',
    company: 'Digital Telco Network India Pvt. Ltd.',
    timestamp: new Date().toISOString()
  });
});

// Plans
router.get('/plans', getPlans);
router.get('/plans/:id', getPlanById);

// Documents (Document upload is protected by magic byte verification and storage sandboxing)
router.post('/documents/upload', multerUpload.single('file'), validateFileSignatures, uploadDocument);
router.get('/documents/:id/preview', getDocumentPreview);
router.get('/documents/:id/download', downloadDocument);
router.delete('/documents/:id', deleteDocument);

// Applications (Public submission & confirmation retrieval)
router.post('/applications', submitApplication);
router.get('/applications/:id', getApplicationPublicDetails);

// Payments (Demonstration / Sandbox workflow)
router.post('/payments/initiate', initiatePayment);
router.post('/payments/simulate', processSimulatedPayment);

// Admin Routes
router.post('/admin/login', adminLogin);
router.get('/admin/me', requireAdminAuth, getAdminProfile);
router.get('/admin/stats', requireAdminAuth, getDashboardStats);
router.get('/admin/applications', requireAdminAuth, getApplicationsList);
router.get('/admin/applications/:id', requireAdminAuth, getApplicationDetails);
router.patch('/admin/applications/:id/status', requireAdminAuth, updateApplicationStatus);
router.get('/admin/export', requireAdminAuth, exportApplicationsToExcel);

export default router;
