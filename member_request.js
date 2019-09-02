const Base = require('./base.js');

import {
  deepClone
} from '../../utils/index.js';

import {
  ID as CONSTS_ID,
  Item as CONSTS_Item
} from '../../utils/jianshenfang_consts.js';

module.exports = class extends Base {
  //  member_request(jianshenfang_member_request) = {
  //    id:int, /*会员用户申请请求id*/ 
  //    user_id:int, /*微信用户id*/ 
  //    name:varchar, /*姓名*/ 
  //    mobile:varchar, /*联系电话*/ 
  //    birthday:varchar, /*生日*/ 
  //    address:varchar, /*联系地址*/ 
  //    request_time:datetime, /*请求时间*/ 
  //    state:tinyint, /*请求状态//0正在请求1同意请求2不同意请求*/ 
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

    const model = this.model('member_request');
    let data;
    if (key != '') {
      if (!precision) {
        data = await model.where({[`${key}`]: ['like', `%${name}%`], is_delete: 0, state: 0}).order(['id ASC']).page(page, size).countSelect();
      }
      else {
        data = await model.where({[`${key}`]: `${name}`, is_delete: 0, state: 0}).order(['id ASC']).page(page, size).countSelect();
      }
    }
    else {
      data = await model.where({is_delete: 0, state: 0}).order(['id ASC']).page(page, size).countSelect();  
    }

    return this.success(data);
  }

  async allAction() {
    const model = this.model('member_request');
    const data = await model.where({
      is_delete: 0
    }).select();

    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('member_request');
    const data = await model.where({
      id: id,
      is_delete: 0
    }).find();

    return this.success(data);
  }
  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('member_request');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('member_request');
    if (id > 0) {
      await model.where({
        id: id,
        is_delete: 0
      }).update(values);
    } else {
      delete values.id;

      
      await model.add(values);
    }
    return this.success(values);
  }

  async okStoreAction() {
    const is_ok = this.post('is_ok');

    if (!this.isPost) {
      return false;
    }

    if (is_ok == null) return this.fail(1000, 'deny');

    let request_state;
    if (is_ok) {
      request_state = parseInt(CONSTS_Item[CONSTS_ID.MEMBER_REQUEST_STATE_AGREE].VALUE);
    } else {
      request_state = parseInt(CONSTS_Item[CONSTS_ID.MEMBER_REQUEST_STATE_NO_AGREE].VALUE);
    }

    const id = this.post('id');

    const model_member_request = this.model('member_request');
    let member_request_result = await model_member_request.where({
      id: id
    }).find();

    let values = deepClone(member_request_result);
    delete values.id;

    
    const coach_result = await this.model('coach').where({user_id: member_request_result.user_id}).find();
    if (!think.isEmpty(coach_result)) {
      return this.fail(401, '已经存在教练' + coach_result.name);
    }

    const member_result = await this.model('member').where({user_id: member_request_result.user_id}).find();
    if (!think.isEmpty(member_result)) {
      return this.fail(401, '已经存在会员' + member_result.name);
    }

    // 创建日期
    values.create_time = think.datetime(Date.now());


    // 更新状态
    await model_member_request.where({
      id: id
    }).update({
      state: request_state,
      is_delete: 1
    });

    // 添加系统消息
    const model_msg = this.model('msg');

    if (is_ok) {
      // 添加会员
      const model_member = this.model('member');
      await model_member.add(values);

      await model_msg.add({
        user_id: values.user_id,
        /*微信用户id*/
        content: "申请会员成功",
        /*消息内容*/
        category: "系统",
        /*分类*/
        create_time: think.datetime(Date.now()),
        /*创建时间*/
      });
    } else {
      await model_msg.add({
        user_id: values.user_id,
        /*微信用户id*/
        content: "管理员不同意您的申请",
        /*消息内容*/
        category: "系统",
        /*分类*/
        create_time: think.datetime(Date.now()),
        /*创建时间*/
      });
    }



    return this.success(values);
  }

  async deleteAction() {
    const id = this.post('id');
    let model = this.model('member_request');
    await model.where({
      id: id
    }).limit(1).update({
      is_delete: 1
    });
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('member_request');
    await model.where({
      id: id
    }).limit(1).delete();
    // TODO 
    return this.success();
  }
};