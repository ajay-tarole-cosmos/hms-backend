const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const StaffPermission = sequelize.define('StaffPermission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    staff_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'staff',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    resource: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Resource name (e.g., 'reservations', 'rooms', 'payments')",
    },
    can_view: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    can_add: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    can_update: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    can_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    sequelize,
    modelName: 'StaffPermission',
    tableName: 'staff_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

StaffPermission.associate = function(models) {
    StaffPermission.belongsTo(models.Staff, {
        foreignKey: 'staff_id',
        as: 'staff',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
};

module.exports = StaffPermission; 