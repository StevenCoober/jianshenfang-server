const Base = require('./base.js');

module.exports = class extends Base {
  //  course_topic_time(jianshenfang_course_topic_time) = {
  //    id:int, /*课程时间id*/ 
  //    course_topic_id:int, /*课程主题id*/ 
  //    course_topic_btime:datetime, /*授课时间*/ 
  //    course_topic_etime:datetime, /*授课结束时间*/ 
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

    const model = this.model('course_topic_time');
    let data;
    if (key != '') {
      if (!precision) {
        data = await model.where({[`${key}`]: ['like', `%${name}%`], is_delete: 0}).order(['course_topic_id ASC, course_topic_btime ASC']).page(page, size).countSelect();
      }
      else {
        data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).order(['course_topic_id ASC, course_topic_btime ASC']).page(page, size).countSelect();
      }
    }
    else {
      data = await model.where({is_delete: 0}).order(['course_topic_id ASC, course_topic_btime ASC']).page(page, size).countSelect();  
    }

    return this.success(data);
  }


  async indexMoreAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const key = 'topic_type_id';
    const name = this.post('name') || '';
    const precision = this.post('precision') || false;

    const model = this.model('course_topic_time');
    let dataSelect = model.alias('ctt').join({
      table: 'course_topic',
      join: 'inner',
      as: 'ct',
      on: ['ctt.course_topic_id', 'id']
    });

    let data;
    // if (key != '') {
    //   if (!precision) {
    data = await dataSelect.where({'ctt.is_delete': 0, 'ct.topic_type_id': name}).field([
      'ctt.id as course_topic_time_id',
      'ct.name as course_topic_name',
      'ctt.*',
      'ct.*',
    ]).order(['ctt.course_topic_id ASC, ctt.course_topic_btime ASC']).page(page, size).countSelect();
      // }
      // else {
      //   data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).order(['course_topic_id ASC, course_topic_btime ASC']).page(page, size).countSelect();
      // }
    // }
    // else {
    //   data = await dataSelect.where({is_delete: 0}).order(['ctto.course_topic_id ASC, ctto.course_topic_btime ASC']).page(page, size).countSelect();  
    // }

    return this.success(data);
  }

  async allAction() {
    const model = this.model('course_topic_time');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('course_topic_time');
    const data = await model.where({id: id, is_delete:0}).order(['course_topic_time ASC']).find();

    return this.success(data);
  }
  
  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('course_topic_time');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('course_topic_time');
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
    let model = this.model('course_topic_time');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('course_topic_time');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

