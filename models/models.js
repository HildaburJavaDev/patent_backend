const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	email: { type: DataTypes.STRING, allowNull: false },
	phoneNumber: { type: DataTypes.STRING, allowNull: false },
	firstname: { type: DataTypes.STRING, allowNull: false },
	lastname: { type: DataTypes.STRING, allowNull: false },
	patronimyc: { type: DataTypes.STRING },
	password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false })

const UserRole = sequelize.define('user_role', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	role_name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false })

const Bid = sequelize.define('bids', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	modelView: { type: DataTypes.STRING },
	modelTitle: { type: DataTypes.STRING },
	modelDescription: { type: DataTypes.TEXT },
	modelFormula: { type: DataTypes.STRING },
	modelFigures: { type: DataTypes.INTEGER },
	refer: { type: DataTypes.STRING },
	createdAt: { type: DataTypes.DATE },
	personalDataProcessingDate: { type: DataTypes.DATE },
	concentToIndicateInfo: { type: DataTypes.BOOLEAN },
	openPublicConclusion: { type: DataTypes.BOOLEAN },
	tesisDecription: { type: DataTypes.TEXT },
	filepath: { type: DataTypes.TEXT, allowNull: false },
	status: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false })



const UserLocation = sequelize.define('user_location', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	mail_index: { type: DataTypes.TEXT, allowNull: false },
	country_name: { type: DataTypes.TEXT, allowNull: false },
	locality: { type: DataTypes.TEXT, allowNull: false },
	street_name: { type: DataTypes.TEXT, allowNull: false },
	house_number: { type: DataTypes.TEXT, allowNull: false },
	flat_number: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: false })

const Collaborator = sequelize.define('collaborators', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	isConfirmed: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: false });

Collaborator.belongsTo(User, { foreignKey: 'user_id' });
Collaborator.belongsTo(Bid, { foreignKey: 'bid_id' });

User.hasMany(Bid, { foreignKey: 'applicant_id' });
Bid.belongsTo(User, { foreignKey: 'applicant_id' });

UserRole.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(UserRole, { foreignKey: 'role_id' });

User.hasMany(UserLocation, { foreignKey: 'user_id' })
UserLocation.belongsTo(User, { foreignKey: 'user_id' })

module.exports = {
	User,
	UserLocation,
	UserRole,
	Collaborator,
	Bid
}