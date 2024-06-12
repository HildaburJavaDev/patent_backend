const APIErrors = require("../errors/APIErrors");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sequelize = require('../db')
const { User, UserRole, UserData, Application, Patent } = require('../models/models')
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const { generateRandomString } = require("../utils/helpers")

class ApplicationsController {
	async create(req, res, next) {
		try {
			const userId = req.user.id
			const user = await User.findOne({
				where: { id: userId },
				include: [{
					model: UserData,
					required: false
				}]
			})
			const templatePath = path.resolve(__dirname, '..', 'static', 'template.docx');
			const filename = generateRandomString(30)
			const content = fs.readFileSync(
				path.resolve(templatePath),
				"binary"
			);
			const zip = new PizZip(content);
			const doc = new Docxtemplater(zip, {
				paragraphLoop: true,
				linebreaks: true,
			});
			console.log(user.lastname + " " + user.firstname)
			doc.render({
				lastname: user.lastname,
				firstname: user.firstname,
				patronimyc: user.patronimyc != undefined ? user.patronimyc : "",
				email: user.email,
				phoneNumber: user.phoneNumber,
			})
			const buf = doc.getZip().generate({
				type: "nodebuffer",
				compression: "DEFLATE",
			});
			const filePath = path.resolve(__dirname, '..', 'static', `${filename}.docx`);
			fs.writeFileSync(filePath, buf);
			const application = await Application.create({
				application_date: new Date(),
				status: 'new',
				application_filepath: filePath,
			});
			await Patent.create({
				patent_name: req.body.patent_name,
				description: req.body.description,
				application_id: application.id,
				owner_id: userId
			})
			return res.json("Success");
		} catch (error) {
			return APIErrors.badRequest("Ошибка заполнения заявления")
		}
	}
}

module.exports = new ApplicationsController()