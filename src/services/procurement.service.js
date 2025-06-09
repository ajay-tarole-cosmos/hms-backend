const { Procurement, ProcurementItem } = require('../models');

exports.createProcurement = async (data) => {
  const { items, ...procurementData } = data;
  const procurement = await Procurement.create(procurementData);
  const itemRecords = items.map(item => ({ ...item, procurement_id: procurement.id }));
  await ProcurementItem.bulkCreate(itemRecords);
  return procurement;
};

exports.getAll = async () => {
  return Procurement.findAll({ include: [{ model: ProcurementItem, as: 'items' }] });
};

exports.verifyByManager = async (id, userId) => {
  return Procurement.update(
    { status: 'manager_verified', verified_by: userId },
    { where: { id, status: 'pending' } }
  );
};

exports.approveByAdmin = async (id, userId, invoice_url) => {
  return Procurement.update(
    { status: 'admin_approved', approved_by: userId, invoice_url },
    { where: { id, status: 'manager_verified' } }
  );
};

exports.reject = async (id, note) => {
  return Procurement.update({ status: 'rejected', note }, { where: { id } });
};
