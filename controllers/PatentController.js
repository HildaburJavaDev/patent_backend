const APIErrors = require("../errors/APIErrors");
const sequelize = require('../db');
const { User, UserLocation, Bid } = require("../models/models");
const { Op } = require('sequelize');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const { generateRandomString } = require("../utils/helpers")

class PatentsController {
	async create(req, res, next) {
		console.log("here!!!")
		console.log(req.body)
		try {
			const {
				collaborators,
				modelView,
				modelTitle,
				modelDescription,
				modelFormula,
				modelFigures,
				refer, // input - 
				concentToIndicateInfo,
				openPublicConclusion,
				tesisDecription
			} = req.body
			if (!modelView || !modelTitle || !modelDescription || !refer)
				return next(APIErrors.badRequest("Указаны не все данные"))
			if (collaborators && !Array.isArray(collaborators))
				return next(APIErrors.forbiddenRequest("Коллаборанты не указаны"))
			const users = await User.findAll({
				where: {
					id: { [Op.in]: collaborators }
				},
				attributes: ['id', 'firstname', 'lastname', 'patronimyc']
			})
			const userDetailsArray = users.map(user => {
				let fullName = `${user.lastname} ${user.firstname}`;
				if (user.patronimyc) {
					fullName += ` ${user.patronimyc}`;
				}
				fullName += ` (${user.id})`;
				return fullName;
			})
			console.log(userDetailsArray)
			const userLocation = await UserLocation.findOne({
				where: {
					user_id: req.user.id
				}
			})
			const userLocationData = {
				mail_index: userLocation.mail_index,
				country_name: userLocation.country_name,
				locality: userLocation.locality,
				street_name: userLocation.street_name,
				house_number: userLocation.house_number,
				flat_number: userLocation.flat_number,
				model_refer: refer,
			};
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
			})
			doc.render({
				userDetails: userDetailsArray,
				mail_index: userLocationData.mail_index,
				country_name: userLocationData.country_name,
				locality: userLocationData.locality,
				street_name: userLocationData.street_name,
				house_number: userLocationData.house_number,
				flat_number: userLocationData.flat_number,
				model_view: modelView,
				model_title: modelTitle,
				model_formula: modelFormula,
				model_figures: modelFigures,
				model_refer: refer,
				concentToIndicateInfo: concentToIndicateInfo,
				openPublicConclusion: openPublicConclusion,
				tesisDecription: tesisDecription
			})
			const buf = doc.getZip().generate({
				type: "nodebuffer",
				compression: "DEFLATE",
			});
			const filePath = path.resolve(__dirname, '..', 'static', `${filename}.docx`);
			fs.writeFileSync(filePath, buf);
			const newBid = await Bid.create({
				modelView: modelView,
				modelTitle: modelTitle,
				modelDescription: modelDescription,
				modelFormula: modelFormula,
				modelFigures: modelFigures,
				refer: refer,
				createdAt: new Date(),
				personalDataProcessingDate: new Date(),
				concentToIndicateInfo: concentToIndicateInfo,
				openPublicConclusion: openPublicConclusion,
				tesisDecription: tesisDecription,
				filepath: `${filename}.docx`,
				applicant_id: req.user.id,
				status: "Обработка"
			})
			return res.json(newBid)
		} catch (error) {
			console.log(error.message)
			return next(APIErrors.badRequest(error.message))
		}
	}

	async getAll(req, res, next) {
		console.log(req.user)
		let queryAll = `
			SELECT 
				bids.id,
				CONCAT (users.firstname || ' ' || users.lastname) AS chief,
				"modelView",
				"modelTitle",
				"createdAt"::date,
				CASE
					WHEN "personalDataProcessingDate" IS NOT NULL THEN 'Подписан'
					ELSE 'Не подписан'
				END AS "personalData",
				status,
				filepath
			FROM bids
			JOIN users ON users.id = bids.applicant_id`;

		try {
			const { status, date } = req.body;

			if (req.user.role_name === 'user') {
				queryAll += ` WHERE applicant_id = ${req.user.id} OR bids.id IN (
					SELECT bid_id FROM collaborators WHERE user_id = ${req.user.id}
				)`;
				console.log("ОТображаем заявки для user")
			}

			console.log(queryAll);

			const results = await sequelize.query(queryAll, { type: sequelize.QueryTypes.SELECT });
			res.json(results);
		} catch (error) {
			return next(APIErrors.badRequest(error));
		}
	}


	async getOne(req, res, next) {
		try {
			const bid = await Bid.findByPk(req.params.bidid)
			if (!bid) {
				return res.status(404).json({ error: 'Bid not found' });
			}
			return res.json(bid);
		} catch (error) {
			return next(APIErrors.badRequest(error));
		}
	}

	async changeStatus(req, res, next) {
		try {
			console.log(req.params.bidid)
			const { status } = req.body
			console.log(status)
			const bid = await Bid.update({ status }, {
				where: {
					id: req.params.bidid
				}
			})
			console.log(bid)
			return res.json(bid)
		} catch (error) {
			console.log(error.message)
			return next(APIErrors.badRequest(error));
		}
	}
}

module.exports = new PatentsController()