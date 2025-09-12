// app/controllers/MemoController.js

/*
const MemoService = require('../services/MemoService');
exports.list = async (req,res,next)=>{ try{ res.json(await MemoService.list(req.user?.id)); }catch(e){next(e);} };
exports.create = async (req,res,next)=>{ try{ res.status(201).json(await MemoService.create(req.user?.id, req.body)); }catch(e){next(e);} };
exports.update = async (req,res,next)=>{ try{ res.json(await MemoService.update(req.user?.id, req.params.id, req.body)); }catch(e){next(e);} };
exports.remove = async (req,res,next)=>{ try{ await MemoService.remove(req.user?.id, req.params.id); res.sendStatus(204);}catch(e){next(e);} };
exports.complete = async (req,res,next)=>{ try{ res.json(await MemoService.complete(req.user?.id, req.params.id)); }catch(e){next(e);} };
exports.notify = async (req,res,next)=>{ try{ res.json(await MemoService.notify(req.user?.id, req.params.id)); }catch(e){next(e);} };
*/

const MemoService = require('../services/MemoService');

function ok(res, data) { return res.json(data); }
function err(res, status, code, message) {
  return res.status(status).json({ code, message });
}

module.exports = {
  async create(req, res) {
    const userId = req.user.id;
    const { subject, body, label, attachments, expiresAt } = req.body || {};

    if (!subject) return err(res, 400, 'VALIDATION_ERROR', 'subject is required');
    if (expiresAt && isNaN(new Date(expiresAt))) return err(res, 400, 'VALIDATION_ERROR', 'invalid expiresAt');

    const memo = await MemoService.createMemo(userId, {
      subject: String(subject),
      body: body || '',
      label: label || 'inbox',
      attachments: attachments || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    return ok(res, memo);
  },

  async list(req, res) {
    const userId = req.user.id;
    const result = await MemoService.listMemos(userId, req.query);
    return ok(res, result);
  },

  async getById(req, res) {
    const userId = req.user.id;
    const { status, memo, error } = await MemoService.getMemoByIdAndAutoRead(userId, req.params.id);
    if (status !== 200) return err(res, status, error);
    return ok(res, memo);
  },

  async claim(req, res) {
    const userId = req.user.id;
    const { status, result, error } = await MemoService.claimAttachment(userId, req.params.id);
    if (status !== 200) return err(res, status, error);
    return ok(res, result);
  },
};
