const Base = require('./base.js');

module.exports = class extends Base {
  //  admin(jianshenfang_admin) = {
  //    id:int, /*管理员id*/ 
  //    username:varchar, /*管理员姓名*/ 
  //    password:varchar, /*管理员密码*/ 
  //    password_salt:varchar, /*管理员秘钥*/ 
  //    nickname:varchar, /*昵称*/ 
  //    last_login_ip:varchar, /*上次登录ip*/ 
  //    last_login_time:datetime, /*上次登录时间*/ 
  //    add_time:datetime, /*添加时间*/ 
  //    update_time:datetime, /*更新时间*/ 
  //    avatar:varchar, /*头像*/ 
  //    admin_role_permission:varchar, /*管理员权限 editor或者admin*/ 
  //    is_delete:tinyint, /*是否删除*/ 
  //  }
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const key = this.post('key') || '';
    const name = this.post('name') || '';
    const precision = this.post('precision') || false;

    const model = this.model('admin');
    let data;
    if (key != '') {
      if (!precision) {
        data = await model.where({[`${key}`]: ['like', `%${name}%`], is_delete: 0}).order(['id ASC']).page(page, size).countSelect();
      }
      else {
        data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).order(['id ASC']).page(page, size).countSelect();
      }
    }
    else {
      data = await model.where({is_delete: 0}).order(['id ASC']).page(page, size).countSelect();  
    }

    return this.success(data);
  }

  async allAction() {
    const model = this.model('admin');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('admin');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('admin');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('admin');
    
    if (values.password.length < 5) return this.fail(401, '密码不能小于5位');

    // values.password = think.md5(values.password + '' + admin.password_salt);
    // delete values.password
    delete values.password_salt
    
    values.password = think.md5(values.password + '' + 'ABCDEF');

    if (id > 0) {
      await model.where({id: id, is_delete: 0}).update(values);
    } else {
      const admin = await this.model('admin').where({
        username: values.username,
        is_delete: 0,
      }).find();
      if (admin) {
        return this.fail(401, '用户名已存在');
      }
      
      delete values.id;
      
      values.password_salt = 'ABCDEF';
      await model.add(values);
    }
    return this.success(values);
  }

  async deleteAction() {
    const id = this.post('id');
    let model = this.model('admin');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('admin');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }

  // 修改密码
  async modifypwdAction() {
    let oldPaw = this.post('oldPaw');
    let newPaw = this.post('newPaw');

    const admin = await this.model('admin').where({
      id: 1,
    }).find();

    if (think.isEmpty(admin)) {
      return this.fail(401, '用户不存在');
    }

    if (think.md5(oldPaw + '' + admin.password_salt) == think.md5(newPaw + '' + admin.password_salt)) {
      return this.fail(401, '新旧密码不能相同');
    }

    if (think.md5(oldPaw + '' + admin.password_salt) !== admin.password) {
      return this.fail(400, '用户名或密码不正确');
    }

    await this.model('admin').where({
      id: 1
    }).update({
      password: think.md5(newPaw + '' + admin.password_salt),
    });

    // 让他不能访问
    const TokenSerivce = this.service('token', 'admin');
    TokenSerivce.create({
      user_id: 1
    });
    return this.fail(403, '请先登录');
  }
};

