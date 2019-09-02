const Base = require('./base.js');

module.exports = class extends Base {
  //  user(jianshenfang_user) = {
  //    id:int, /*人员id*/ 
  //    username:varchar, /*名称*/ 
  //    password:varchar, /*密码*/ 
  //    register_time:varchar, /*注册时间*/ 
  //    register_ip:varchar, /*注册ip*/ 
  //    last_login_time:datetime, /*上次登录时间*/ 
  //    last_login_ip:varchar, /*上次登录ip*/ 
  //    weixin_openid:varchar, /*微信openid*/ 
  //    avatar:varchar, /*头像*/ 
  //    gender:int, /*性别 0：未知、1：男、2：女*/ 
  //    nickname:varchar, /*昵称*/ 
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

    const model = this.model('user');
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
    const model = this.model('user');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('user');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('user');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('key');

    const model = this.model('user');
    if (id > 0) {
      await model.where({id: id, is_delete: 0}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }
    return this.success(values);
  }

  async deleteAction() {
    const id = this.post('id');
    let model = this.model('user');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('user');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

