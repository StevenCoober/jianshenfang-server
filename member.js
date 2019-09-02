const Base = require('./base.js');

import {
  ID as CONSTS_ID,
  Item as CONSTS_Item,
  Item_Of_VALUE as CONSTS_ITEM_OF_VALUE,
  Item_Of_DESC as CONSTS_ITEM_OF_DESC,
} from '../../utils/jianshenfang_consts.js';

module.exports = class extends Base {
  //  member(jianshenfang_member) = {
  //    id:int, /*会员用户id*/ 
  //    user_id:int, /*微信用户id*/ 
  //    name:varchar, /*姓名*/ 
  //    mobile:varchar, /*联系电话*/ 
  //    birthday:date, /*生日*/ 
  //    address:varchar, /*联系地址*/ 
  //    create_time:datetime, /*创建日期*/ 
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

    const model = this.model('member');
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
    const model = this.model('member');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('member');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误1');
    if (name == null) return this.fail(401, '数据错误2');

    const model = this.model('member');
    const data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('member');
    if (id > 0) {
      const user_id = this.post('user_id');

      await this.model('member').where({
        user_id: user_id,
        is_delete: 0
      }).update({
        user_id: 0
      });
      
      await model.where({id: id, is_delete: 0}).update(values);
    } else {
      delete values.id;
      
      

      let result = await model.where().select();
      if (think.isEmpty(result)) {
        values.id = 10000;
      }
      values.create_time = think.datetime(Date.now());
      await model.add(values);
    }
    return this.success(values);
  }

  async storeMoreAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const address = values.address;
    const birthday = values.birthday;
    const card_type_create_time = values.card_type_create_time;
    const card_type_end_time = values.card_type_end_time;
    const card_type_id = values.card_type_id;
    const card_type_use_times = values.card_type_use_times;
    const create_time = values.create_time;
    const id = values.id;
    const is_show = values.is_show;
    const mobile = values.mobile;
    const name = values.name;
    const user_id = values.user_id;


    if (card_type_id == CONSTS_ITEM_OF_VALUE('TIMES_CARD')) {
      if (card_type_use_times == null || card_type_use_times == '') {
        return this.fail(401, '参数错误');
      }
    }
    else {

      if (card_type_create_time == '' || 
          card_type_create_time == null || 
          card_type_end_time == '' ||
          card_type_end_time == null
          ) {
        return this.fail(401, '请填写日期');
      }
    }

    // const id = this.post('id');

    const model = this.model('member');
    if (id > 0) {
      await model.where({id: id, is_delete: 0}).update(values);
    } else {
      delete values.id;

      let result = await model.where().select();
      if (think.isEmpty(result)) {
        values.id = 10000;
      }

      values.create_time = think.datetime(Date.now());
      let result_id = await model.add({
        user_id: values.user_id, /*微信用户id*/
        name: values.name, /*姓名*/
        mobile: values.mobile, /*联系电话*/
        birthday: values.birthday, /*生日*/
        address: values.address, /*联系地址*/
        create_time: values.create_time, /*创建日期*/
        is_delete: values.is_delete, /*是否删除*/
        gender: values.gender, /*性别*/
      });


      const model_member_card = this.model('member_card');
      await model_member_card.add({
        user_id: result_id, /*用户id*/ 
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
    let model = this.model('member');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('member');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

