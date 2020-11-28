import { showErrorModal } from '/utils/index.js';

let db = null;

App({
	/* 全局数据区 */
	globalData: {
		firstlogin: true,
		needChangePassword: false,
		studyData: null,
		weekNum: 0,
		_openid: null,
		userInfo: {},
		isNoBind: false
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
				wx.setStorage({
					key: '_openid',
					data: this.globalData._openid
				});
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
		this.globalData.firstlogin = (this.globalData.userInfo && '_id' in this.globalData.userInfo) ? false : true;
	},
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