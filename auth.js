const Base = require('./base.js');

module.exports = class extends Base {
  async loginAction() {
    const username = this.post('username');
    const password = this.post('password');

    const admin = await this.model('admin').where({
      username: username
    }).find();
    if (think.isEmpty(admin)) {
      return this.fail(401, '用户名或密码不正确');
    }


    if (think.md5(password + '' + admin.password_salt) !== admin.password) {
      return this.fail(400, '用户名或密码不正确');
    }

    // 更新登录信息
    await this.model('admin').where({
      id: admin.id
    }).update({
      last_login_time: think.datetime(Date.now()),
      last_login_ip: this.ctx.ip.replace("::ffff:", "")
    });

    const TokenSerivce = this.service('token', username);
    const sessionKey = await TokenSerivce.create({
      user_id: admin.id
    });

    if (think.isEmpty(sessionKey)) {
      return this.fail(400, '登录失败');
    }

    const userInfo = {
      id: admin.id,
      username: admin.username,
      avatar: admin.avatar,
      admin_role_permission: admin.admin_role_permission,
      nickname: admin.nickname, // 昵称
    };

    return this.success({
      token: sessionKey,
      // userInfo: userInfo
    });
  }

  async infoAction() {
    if (think.userId <= 0) {
      return this.fail(403, '请先登录');
    }

    const admin = await this.model('admin').where({
      id: think.userId
    }).find();

    // 更新登录信息
    await this.model('admin').where({
      id: admin.id
    }).update({
      last_login_time: think.datetime(Date.now()),
      last_login_ip: this.ctx.ip.replace("::ffff:", "")
    });

    const userInfo = {
      id: admin.id,
      username: admin.username,
      avatar: admin.avatar,
      admin_role_permission: admin.admin_role_permission,
      nickname: admin.nickname, // 昵称
    };


    return this.success({
      userInfo: userInfo
    });
  }

  async logoutAction() {
    return this.success();
  }
};