const Base = require('./base.js');

module.exports = class extends Base {
  //  coach_request(jianshenfang_coach_request) = {
  //    id:int, /*教练申请请求id*/ 
  //    user_id:int, /*微信用户id*/ 
  //    name:varchar, /*姓名*/ 
  //    mobile:varchar, /*联系电话*/ 
  //    birthday:varchar, /*生日*/ 
  //    address:varchar, /*联系地址*/ 
  //    price:int, /*价格*/ 
  //    summary:text, /*简介*/ 
  //    num:int, /*带课量*/ 
  //    skill:varchar, /*特长*/ 
  //    head_img:varchar, /*头像*/ 
  //    income:int, /*收入*/ 
  //    views:int, /*浏览量*/ 
  //    paixu:int, /*排序*/ 
  //    is_star:int, /*是否是明星教练*/ 
  //    request_time:datetime, /*请求时间*/ 
  //    state:tinyint, /*请求状态//0未处理1已经处理*/ 
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

    const model = this.model('coach_request');
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
    const model = this.model('coach_request');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('coach_request');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('coach_request');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('coach_request');
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
    let model = this.model('coach_request');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('coach_request');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

