const Base = require('./base.js');

module.exports = class extends Base {
  //  private_course(jianshenfang_private_course) = {
  //    id:int, /*私教课购买id*/ 
  //    member_card_id:int, /*会员卡id*/ 
  //    coach_id:int, /*教练id*/ 
  //    course_id:int, /*私教课id(教练特长id)*/ 
  //    start_time:datetime, /*开始日期*/ 
  //    end_time:datetime, /*有效日期*/ 
  //    price:int, /*金额*/ 
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

    const model = this.model('private_course');
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
    const model = this.model('private_course');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('private_course');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('private_course');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('private_course');
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
    let model = this.model('private_course');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('private_course');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

