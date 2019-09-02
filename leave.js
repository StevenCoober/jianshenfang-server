const Base = require('./base.js');
const moment = require('moment');
module.exports = class extends Base {
  //  leave(jianshenfang_leave) = {
  //    id:int, /*健身房请假id*/ 
  //    member_card_id:int, /*会员卡id*/ 
  //    start_time:datetime, /*开始日期*/ 
  //    end_time:datetime, /*有效日期*/ 
  //    desc:varchar, /*备注*/ 
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

    const model = this.model('leave');
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
    const model = this.model('leave');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('leave');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('leave');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');
    const member_card_id = this.post('member_card_id');
    const start_time = this.post('start_time');
    const end_time = this.post('end_time');
    let diff_days = moment(end_time).diff(moment(start_time), 'days');

    const result_member_card = await this.model('member_card').where({id: member_card_id, is_delete: 0}).find();

    const result_member_card_type = await this.model('member_card_type').where({id: result_member_card.card_type_id, is_delete: 0}).find();

    if (result_member_card_type.limit_type == 1) {
      return this.fail(401, '这是个' + result_member_card_type.card_name);
    }

    // 延长卡的日期
    await this.model('member_card').where({id: member_card_id, is_delete: 0}).update({
      end_time: moment(end_time).add(diff_days, 'days').format('YYYY-MM-DD HH:mm:ss')
    });

    const model = this.model('leave');
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
    let model = this.model('leave');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('leave');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

