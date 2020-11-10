const AV = require('./utils/av-weapp-min.js');
AV.init({
	appId: 'UxfyuN3Flo7PAOOYoLg7CGkh-9Nh9j0Va',
	appKey: 'ii5IeTaCTc9N5q9Qf2HXuzvW',
	serverURLs: "https://gxdt.kanux.cn",
});
import { jsonify, isQQApp, showErrorModal } from '/utils/index.js';
var avUser = null;//存放user变量
App({
	/* 全局数据区 */
	globalData: {
		firstlogin: 1,
		needChangePassword: 0,
		studyData: null,
		user: null,
		weekNum: 0
	},
	/* app.js全局启动前 */
	onLaunch() {
		this.login_getUserInfo();
	},
	login_getUserInfo() {
		avUser = AV.User.current();
		if (!avUser) {
			this.login();
		} else {
			this.globalData.user = jsonify(avUser);
			this.getUserInfo();
		}
	},
	login() {
		const loginFN = isQQApp ? AV.User.loginWithQQApp : AV.User.loginWithWeapp({
			preferUnionId: true,
		});
		loginFN.then(user => {
			avUser = user;
			this.globalData.user = jsonify(avUser);
			// console.log(avUser);
			// AV.Cloud.run('hello').then(data => {
			//   console.log(data)
			// }).catch(error => {
			//   showErrorModal(error.message);
			// });
			this.getUserInfo();
		}).catch(error => {
			showErrorModal(error.message);
		});
	},
	getUserInfo() {
		//获取用户信息
		this.globalData.firstlogin = this.globalData.user.userInfo ? 0 : 1;
		this.globalData.needChangePassword = this.globalData.user.needChangePass;
		if (this.globalData.firstlogin == 0) {
			//获取学习数据
			this.getStudyData();
		}
	},
	getStudyData() {
		let studyData = wx.getStorageSync('studyData') || "";
		const nowTime = Math.round(new Date().getTime() / 1000);
		//如果缓存大于一天或SD为null，就更新数据
		if (((nowTime - studyData.addStorTime) > (86400*1)) || !studyData) {
			let query = new AV.Query('study_data');
			query.equalTo('user', avUser).first().then((study_data) => {
				studyData = jsonify(study_data);
				this.globalData.studyData = studyData;
				studyData.addStorTime = Math.round(new Date().getTime() / 1000);
				wx.setStorage({
					key: 'studyData',
					data: studyData
				});
				this.okCallBack(studyData);
			}).catch(error => {
				showErrorModal(error.message);
			});

		} else {
			this.globalData.studyData = studyData;
			this.okCallBack(studyData);
		}
	},
	okCallBack(studyData) {
		let res = {
			'studyData': studyData,
			'firstlogin': this.globalData.firstlogin,
			'needChangePassword': this.globalData.needChangePassword
		}
		if (this.userInfoReadyCallback) {
			this.userInfoReadyCallback(res);
		}
	}
})