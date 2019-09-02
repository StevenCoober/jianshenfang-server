const Base = require('./base.js');

module.exports = class extends Base {
  //  visitor(jianshenfang_visitor) = {
  //    id:int, /*访客id*/ 
  //    member_id:int, /*会员id*/ 
  //    add_time:datetime, /*登记日期*/ 
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

    const model = this.model('visitor');
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
    const model = this.model('visitor');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }


  async allTimesAction() {
    const member_card_id = this.post('member_card_id');
    const model = this.model('visitor');
    const data = await model.where({member_card_id:member_card_id, is_delete:0}).count('*');
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('visitor');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }
  
  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('visitor');
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

    let result_member_card = await this.model('member_card').where({id: member_card_id}).find();

    
    if (think.isEmpty(result_member_card)) {
      return this.fail(401, '会员卡不存在');
    }

    // 0时间卡1次数卡
    let result_member_card_type = await this.model('member_card_type').where({id: result_member_card.card_type_id}).find();
    if (result_member_card_type.limit_type == 0) {
      return this.fail(401, '这是个' + result_member_card_type.card_name );
    }

    if (result_member_card.left_times <= 0) {
      return this.fail(401, '会员卡次数用完了');
    }

    await this.model('member_card').where({id: member_card_id}).update({
      left_times: result_member_card.left_times - 1
    });

    const model = this.model('visitor');

    if (id > 0) {
      await model.where({id: id, is_delete: 0}).update(values);
    } else {
      delete values.id;
      let result = await model.where().select();
      if (think.isEmpty(result)) {
        values.id = 10000;
      }
      values.add_time = think.datetime(Date.now());
      await model.add(values);
    }
    return this.success(values);
  }

  async deleteAction() {
    const id = this.post('id');
    let model = this.model('visitor');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('visitor');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

