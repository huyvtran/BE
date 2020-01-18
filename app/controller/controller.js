const db = require('../config/db.config.js');
const config = require('../config/config.js');
//const mutler = require('../config/multer.config.js');
var multer = require('multer');
var upload = multer({ dest: 'upload/' });
var fs = require('fs');

const User = db.user;
const Role = db.role;
const Product = db.product;
const Property = db.property;

const Op = db.Sequelize.Op;
var multer = require("multer");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const uploadFolder = __basedir + '/products/';

exports.reseller = (req, file, res) => {
	res.send('File uploaded successfully! ');

}

exports.addproductdetails = (req, file, res) => {

	var type = upload.single('image');
	console.log("req.body is ");
	console.log(req.body);
	var tmp_path = req.file.path;

	/** The original name of the uploaded file
		stored in the variable "originalname". **/
	var target_path = 'uploads/' + req.file.originalname;

	/** A better way to copy the uploaded file. **/
	var src = fs.createReadStream(tmp_path);
	var dest = fs.createWriteStream(target_path);
	src.pipe(dest);
	src.on('end', function () { res.render('complete' + target_path); });
	src.on('error', function (err) { res.render('error'); });

}


exports.products = (req, res) => {
	res.send('ghgFile uploaded successfully!');
}


exports.properties = (req, res) => {
	res.send('ghgFile uploaded successfully!');
}


exports.signup = (req, res) => {
	// Save User to Database
	console.log("Processing func -> SignUp");

	User.create({

		Business_name: req.body.Business_name,
		owner_name: req.body.owner_name,
		owneraddress: req.body.owneraddress,
		Email_address: req.body.Email_address,
		Gst_no: req.body.Gst_no,
		password: bcrypt.hashSync(req.body.password),
		cpass: bcrypt.hashSync(req.body.cpass),
		phone_no: req.body.phone_no,
		Registration_certificate: req.body.Registration_certificate,
		GST_Certificate: req.body.GST_Certificate,
		Pan_card: req.body.Pan_card,
		Product_category: req.body.Product_category,
		complete_address: req.body.complete_address,
		status: req.body.status,
		Wallet: req.body.Balance,
		Balance: req.body.Balance

	}).then(user => {
		Role.findAll({
			where: {
				name: {
					[Op.or]: req.body.roles
				}
			}
		}).then(roles => {
			user.setRoles(roles).then(() => {
				res.send("User registered successfully!");
			});
		}).catch(err => {
			res.status(500).send("Error -> " + err);
		});
	}).catch(err => {
		res.status(500).send("Fail! Error -> " + err);
	})
}



exports.listUrlFiles = (req, res) => {
	fs.readdir(uploadFolder, (err, files) => {
		for (let i = 0; i < files.length; ++i) {
			files[i] = "http://localhost:8080/api/file/" + files[i];
		}

		res.send(files);
	})
}


exports.downloadFile = (req, res) => {
	let filename = req.params.filename;
	res.download(uploadFolder + filename);
}


exports.product = (req, res) => {
	// Save User to Database
	console.log("Processing func -> Adding Products");
	Product.create({
		name: req.body.name,
		desc: req.body.desc,
		discount: req.body.discount,
		price: req.body.price,
		sub:req.body.sub,
		image: req.body.image,
		image1: req.body.image1,
		image2: req.body.image2,
		image3: req.body.image3,
		image4: req.body.image4,
		category: req.body.category,
		userId:req.body.userId

	}).then(product => {
		res.status(200).json({
			"description": "Product Added",
			"product": product
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Product Page",
			"error": err
		});
	})
}

exports.property = (req, res) => {
	// Save User to Database
	console.log("Processing func -> Adding Products");
	Property.create({
		propertyname: req.body.propertyname,
		propertydesc: req.body.propertydesc,
		propertyprice: req.body.propertyprice,
		category: req.body.category,
		propertyimage: req.body.propertyimage,
		propertyimage1: req.body.propertyimage1,
		propertyimage2: req.body.propertyimage2,
		propertyimage3: req.body.propertyimage3,
		propertyimage4: req.body.propertyimage4,
		userId:req.body.userId

	}).then(property => {
		res.status(200).json({
			"description": "property Added",
			"product": property
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access property Page",
			"error": err
		});
	})
}


exports.signin = (req, res) => {
	console.log("Sign-In");

	User.findOne({
		where: {
			Email_address: req.body.Email_address,

			status: 1
		}

	}).then(user => {
		if (!user) {
			return res.status(404).send('User Not Found or not approved.');
		}

		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		if (!passwordIsValid) {
			return res.status(401).send({ auth: false, accessToken: null, reason: "Invalid Password!" });
		}


		var token = jwt.sign({ id: user.id }, config.secret, {
			expiresIn: 86400 // expires in 24 hours
		});

		res.status(200).send({ auth: true, accessToken: token });

	}).catch(err => {
		res.status(500).send('Error -> ' + err);
	});
}

exports.userContent = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			"description": "User Content Page",
			"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access User Page",
			"error": err
		});
	})
}

exports.adminContent = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['id', 'phone_no', 'Email_address'],
		include: [{
			model: Role,
			attributes: ['name'],

		}]
	}).then(user => {
		res.status(200).json({
			"description": "User Content Page",
			"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access User Page",
			"error": err
		});
	})
}

exports.userList = (req, res) => {
	User.findAll({

		attributes: ['id', 'owner_name', 'Email_address', 'phone_no', 'status'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			//"description": "Admin Board",
			"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Admin Board",
			"error": err
		});
	})
}


exports.userview = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['owner_name', 'business_name', 'Email_address', 'phone_no', 'owneraddress','Wallet', 'Balance'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			//"description": "Admin Board",
			user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Admin Board",
			"error": err
		});
	})
}


exports.productList = (req, res) => {
	Product.findAll({
		attributes: ['name', 'price', 'discount', 'desc', 'category', 'image','userId','sub'],
	}).then(product => {
		res.status(200).json({
			//"description": "Admin Board",
			product
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Admin Board",
			"error": err
		});
	})
}


exports.propertyList = (req, res) => {
	Property.findAll({
		attributes: ['propertyname', 'propertyprice', 'propertyimage','userId'],
	}).then(property => {
		res.status(200).json({
			//"description": "Admin Board",
			property
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Admin Board",
			"error": err
		});
	})
}


exports.productCount = (req, res) => {
	Product.count({
		attributes: ['name', 'price', 'discount', 'desc', 'image'],
	}).then(product => {
		res.status(200).json({
			//"description": "Admin Board",
			"user": product
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Admin Board",
			"error": err
		});
	})
}



exports.userCount = (req, res) => {
	User.count({

		attributes: ['owner_name', 'Email_address', 'phone_no'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			//"description": "Admin Board",
			user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Admin Board",
			"error": err
		});
	})
}


exports.updateUserStatus = (req, res) => {

	console.log(req);
	var id = req.params.id;
	var status = req.params.status;
	if (status == 1) {
		User.update(
			{ status: '0' },
			{ where: { id: id } }
		).then(user => {
			res.status(200).json({
				"description": "Management Board",
				"user": user
			});
		}).catch(err => {
			res.status(500).json({
				"description": "Can not access Management Board",
				"error": err
			});
		})
	} else {
		User.update(
			{ status: '1' },
			{ where: { id: id } }
		).then(user => {
			res.status(200).json({
				"description": "Management Board",
				"user": user
			});
		}).catch(err => {
			res.status(500).json({
				"description": "Can not access Management Board",
				"error": err
			});
		})
	}
}




exports.wallet = (req, res) => {
	var id = req.params.id;
	User.findOne({
		where: { id: id },
		attributes: ['Wallet', 'owner_name']
	
	}).then(user => {
		res.status(200).json({
				"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Management Board",
			"error": err
		});
	})
}




exports.Updatewallet = (req, res) => {
	var id = req.params.id;

	User.update(
		{ Wallet:req.body.Wallet },
			{ where: { id: id } }
		).then(user => {
			res.status(200).json({
				"description": user
			
			});
		}).catch(err => {
			res.status(500).json({
				"description": "Can not access Management Board",
				"error": err
			});
	})
}



exports.managementBoard = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			"description": "Management Board",
			"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Management Board",
			"error": err
		});
	})
}