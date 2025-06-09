const catchAsync = require('../utils/catchAsync');
const service = require('../services/procurement.service');

exports.create = catchAsync(async (req, res) => {
  const data = req.body;
  data.created_by = req.user.id;
  const procurement = await service.createProcurement(data);
  res.status(201).json({ success: true, data: procurement });
});

exports.getAll = catchAsync(async (req, res) => {
  const result = await service.getAll();
  res.status(200).json({ success: true, data: result });
});

exports.verify = catchAsync(async (req, res) => {
  const { id } = req.params;
  await service.verifyByManager(id, req.user.id);
  res.status(200).json({ success: true, message: "Verified" });
});

exports.approve = catchAsync(async (req, res) => {
  const { id } = req.params;
  const invoice_url = req.file?.path;
  await service.approveByAdmin(id, req.user.id, invoice_url);
  res.status(200).json({ success: true, message: "Approved" });
});

exports.reject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  await service.reject(id, note);
  res.status(200).json({ success: true, message: "Rejected" });
});
