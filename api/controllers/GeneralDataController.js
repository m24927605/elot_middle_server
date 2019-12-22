/**
 * GeneralDataController
 *
 * @description :: Server-side logic for managing generaldatas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function (req, res) {
		const general_data = req.body;
		GeneralMetaData.findOne({ code: general_data.code }).exec((err, record) => {
			if (err) {
				res.json(err);
			}
			if (record) {
				GeneralData.create(general_data).exec((err, data) => {
					res.json(data);
				});
			} else {
				res.json({ error: "generate meta data is not existed" });
			}
		});
	}
};

