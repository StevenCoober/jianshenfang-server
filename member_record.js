const Base = require('./base.js');

module.exports = class extends Base {
  //  member_record(jianshenfang_member_record) = {
  //    id:int, /*会员用户申请请求id*/ 
  //    user_id:int, /*微信用户id*/ 
  //    name:varchar, /*姓名*/ 
  //    mobile:varchar, /*联系电话*/ 
  //    birthday:varchar, /*生日*/ 
  //    address:varchar, /*联系地址*/ 
  //    request_time:datetime, /*请求时间*/ 
  //    state:tinyint, /*请求状态//0未处理1已经处理*/ 
  //    gender:int, /*性别*/ 
  //    identity_card:varchar, /*身份证*/ 
  //    life_photo:varchar, /*生活照*/ 
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

    const model = this.model('member_record');
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
    const model = this.model('member_record');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('member_record');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }
  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('member_record');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model_member_record = this.model('member_record');

    if (id > 0) {
      await model_member_record.where({id: id, is_delete: 0}).update(values);

      // this.model('member').where({id: id, is_delete: 0}).update(values);
    } else {
      delete values.id;
      
      const model_member = this.model('member');
      const result_member = await model_member.where({
        identity_card: values.identity_card,
        is_delete: 0
      }).find();

      if (!think.isEmpty(result_member)) {
        return this.fail(401, '会员身份证信息已经存在');
      }

      await model_member_record.add(values);

    }
    return this.success(values);
  }

  async storeMoreAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model_member_record = this.model('member_record');

    if (id > 0) {
      await model_member_record.where({id: id, is_delete: 0}).update(values);
      await this.model('member').where({identity_card: values.identity_card, is_delete: 0}).update(values);
    } else {
      delete values.id;
      
      const model_member = this.model('member');
      const result_member = await model_member.where({
        identity_card: values.identity_card,
        is_delete: 0
      }).find();

      if (!think.isEmpty(result_member)) {
        return this.fail(401, '会员身份证信息已经存在');
      }

      let result_id = await model_member.add(values);      

      await model_member_record.add(values);

      const model_member_card = this.model('member_card');
      await model_member_card.add({
        user_id: result_id, /*会员用户id*/ 
        card_type_id: values.card_type_id, /*会员卡类型id*/ 
        create_time: values.card_type_create_time, /*创建时间*/ 
        end_time: values.card_type_end_time, /*会员卡到期时间*/
        use_times: values.use_times,
        left_times: values.use_times,
        is_delete: 0, /*是否删除*/ 
      });
    }

    return this.success(values);
  }

  async deleteAction() {
    const id = this.post('id');
    let model = this.model('member_record');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('member_record');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

