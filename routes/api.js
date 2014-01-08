var crypto = require('crypto'),
	User = require('../models/user.js'),
	Post = require('../models/post.js');


exports.posts = function(req, res) {
	var who = req.params.who;
	if(who === "null"){who = null}
	var page = req.params.page;
	var state = req.params.state;
	Post.getTen(who, state, page, function (err, docs, total) {
		if(err) {
			docs = [];
			total = 0;
		}
		var posts = [];
		docs.forEach(function (post, i) {
			posts.push({
				name: post.name,
				time: post.time,
				post: post.post,
				state: post.state,
				share: post.share,
				id:post._id
			});
		});
		res.json({
			posts:posts,
			page: page,
			total: total
		});
	});	
};

exports.addPost = function(req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post, req.body.state, req.body.share);
	post.save(
		function (err) {
			if (err) {
			  console.log(err);
			}
			res.redirect('/');
			}
		);
};
exports.deletePost = function(req, res) {
	var currentUser = req.session.user;
	Post.delete(currentUser.name, req.params.id, function (err) {
		if (err) {
			return	res.json({
						msg: "不是你的东西你删他干吗？"
					})
		}
		res.json({
			msg: "删除成功"
		});
	});
};
exports.reg = function(req, res) {
	var md5 = crypto.createHash('md5'),
 	    password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name: req.body.name,
		password: password
	});
	User.get(newUser.name, function (err, user) {
		if (user) {
			return res.redirect('/');
		} else {
			newUser.save(
				function (err, user) {
					if (err) {
						console.log("user.save失败");
					}
					req.session.user = user;
					res.json({
						username: req.session.user.name
					})
				}
			);
		}
	});
};
exports.login = function(req, res) {
	var md5 = crypto.createHash('md5'),
 	    password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
		if (!user) {
			return res.json({
						msg: '用户不存在!'
					});
		}
		if (user.password != password) {
			return res.json({
						msg: '密码错误!'
					});
		}
		req.session.user = user;
		res.json({
			username: req.session.user.name,
			msg: '登录成功！'
		})
	});
};
exports.session = function(req, res) {
	if(!req.session.user){
		res.json({
			username: null,
		})
	}else {
		res.json({
			username: req.session.user.name,
		});
	}
};
exports.logout = function(req, res) {
	req.session.user = null;
	return res.json({
				msg: '退出成功!',
				username: null
			});
};