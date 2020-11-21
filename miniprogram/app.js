import { showErrorModal } from '/utils/index.js';
import { promisifyAll } from 'miniprogram-api-promise';

const wxp = {}
promisifyAll(wx, wxp)
// promise化所有wxAPI

let db = null;

App({
	/* 全局数据区 */
	globalData: {
		firstlogin: true,
		needChangePassword: 0,
		studyData: null,
		weekNum: 0,
		_openid: null,
		userInfo: {},
		db: null	// 云开发数据库引用
	},
	async onLaunch() {
		this.cloudInit();
		await this.get_openid();
		await this.getUserInfo();
		this.okCallBack();
	},
	async get_openid() {
		try {
			let cache_openid = wx.getStorageSync('_openid') || false;
			if (cache_openid) {
				this.globalData._openid = cache_openid;
			} else {
				//缓存中没有，从云函数中获取openid
				const openidResp = await wx.cloud.callFunction({
					name: 'getOpenid',
				});
				this.globalData._openid = openidResp.result;
				console.log('获取到openid：' + this.globalData._openid);
			}
		}
		catch (e) {
			showErrorModal('获取OPENID失败', e);
		}
	},
	cloudInit() {
		if (!wx.cloud) {
			console.error('请使用 2.2.3 或以上的基础库以使用云能力')
		} else {
			wx.cloud.init({
				env: 'release-5gt6h0dtd3a72b90',
				traceUser: true,
			});
			db = wx.cloud.database({
				env: 'release-5gt6h0dtd3a72b90'
			});
		}
	},
	async getUserInfo() {
		//获取用户信息
		try {
			const userInfoRes = await db.collection('user').where({
				_openid: this.globalData._openid,
			}).get();
			const userInfo = userInfoRes.data[0];
			console.log('获取到userInfo：' + JSON.stringify(userInfo));
			this.globalData.userInfo = userInfo;
		} catch (e) {
			showErrorModal('获取用户信息失败', e);
		}
		this.globalData.firstlogin = '_id' in this.globalData.userInfo ? false : true;
		// this.globalData.needChangePassword = this.globalData.user.needChangePass;
		// if (this.globalData.firstlogin == 0) {
		// 	//获取学习数据
		// 	this.getStudyData();
		// }
	},
	// getStudyData() {
	// 	let studyData = wx.getStorageSync('studyData') || "";
	// 	const nowTime = Math.round(new Date().getTime() / 1000);
	// 	//如果缓存大于一天或SD为null，就更新数据
	// 	if (((nowTime - studyData.addStorTime) > (86400 * 1)) || !studyData) {
	// 		let query = new AV.Query('study_data');
	// 		query.equalTo('user', avUser).first().then((study_data) => {
	// 			studyData = jsonify(study_data);
	// 			this.globalData.studyData = studyData;
	// 			studyData.addStorTime = Math.round(new Date().getTime() / 1000);
	// 			wx.setStorage({
	// 				key: 'studyData',
	// 				data: studyData
	// 			});
	// 			this.okCallBack(studyData);
	// 		}).catch(error => {
	// 			showErrorModal(error.message);
	// 		});

	// 	} else {
	// 		this.globalData.studyData = studyData;
	// 		this.okCallBack(studyData);
	// 	}
	// },
	okCallBack() {
		let res = {
			'_openid': this.globalData._openid,
			'firstlogin': this.globalData.firstlogin,
			'userInfo': this.globalData.userInfo
		}
		if (this.userInfoReadyCallback) {
			this.userInfoReadyCallback(res);
		}
	}
})