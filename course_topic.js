const Base = require('./base.js');
const moment = require('moment');
import {
  ID as CONSTS_ID,
  Item as CONSTS_Item,
  Item_Of_VALUE as CONSTS_ITEM_OF_VALUE,
  Item_Of_DESC as CONSTS_ITEM_OF_DESC,
} from '../../utils/jianshenfang_consts.js';

module.exports = class extends Base {
  //  course_topic(jianshenfang_course_topic) = {
  //    id:int, /*课程主题id*/ 
  //    name:varchar, /*详细名称*/ 
  //    top_ad:text, /*顶部导航*/ 
  //    coach_id:int, /*教练id*/ 
  //    topic_type_id:int, /*主题类型id*/ 
  //    desc:varchar, /*简介*/ 
  //    add_time:datetime, /*添加时间*/ 
  //    class_num:int, /*节数*/ 
  //    class_price:decimal, /*金额*/ 
  //    detail:text, /*描述*/ 
  //    is_delete:tinyint, /*是否删除*/ 
  //    generate_way:int, /*生成方式*/ 
  //    generate_content:varchar, /*生成的内容*/ 
  //    course_topic_time_bday:date, /*开始日期*/ 
  //    course_topic_time_eday:date, /*结束日期*/ 
  //    course_topic_time_bhour:time, /*开始时间*/ 
  //    course_topic_time_ehour:time, /*结束时间*/ 
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

    const model = this.model('course_topic');
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
    const model = this.model('course_topic');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('course_topic');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('course_topic');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');
    const model = this.model('course_topic');

    if (id > 0) {
      delete values.add_time;
      delete values.generate_way;
      delete values.generate_content;
      delete values.course_topic_time_bday;
      delete values.course_topic_time_eday;
      delete values.course_topic_time_bhour;
      delete values.course_topic_time_ehour;
      await model.where({id: id, is_delete: 0}).update(values);
    } else {
      delete values.id;
      values.add_time = think.datetime(Date.now());
      let result_id = await model.add(values);

      const generate_way = values.generate_way;
      const generate_content = values.generate_content;
      const course_topic_time_bday = values.course_topic_time_bday;
      const course_topic_time_eday = values.course_topic_time_eday;
      const course_topic_time_bhour = values.course_topic_time_bhour;
      const course_topic_time_ehour = values.course_topic_time_ehour;

      let diff_days;
      if (generate_way != null) {
        diff_days = moment(course_topic_time_eday).diff(moment(course_topic_time_bday), 'days');
      }
      
      const model_course_topic_time = this.model('course_topic_time');
      if (generate_way == parseInt(CONSTS_ITEM_OF_VALUE("BY_WEEK"))) {
        let weeks = JSON.parse(generate_content);
        for(let i = 0; i <= diff_days; i++) {
          let that_day = moment(course_topic_time_bday).add(i, 'days');
          let that_week = that_day.weekday();
          if (weeks.indexOf(that_week+'') != -1) {
            await model_course_topic_time.add({
               course_topic_id: result_id, /*课程主题id*/ 
               course_topic_btime: that_day.format('YYYY-MM-DD') + " " + course_topic_time_bhour, /*授课时间*/ 
               course_topic_etime: that_day.format('YYYY-MM-DD') + " " + course_topic_time_ehour, /*授课结束时间*/
            });
          }
        }
      }
      else if (generate_way == parseInt(CONSTS_ITEM_OF_VALUE("BY_DAY"))) {
        let day = parseInt(generate_content);
        for(let i = day; i <= diff_days; i += day + 1) {
          let that_day = moment(course_topic_time_bday).add(i, 'days');
          await model_course_topic_time.add({
             course_topic_id: result_id, /*课程主题id*/ 
             course_topic_btime: that_day.format('YYYY-MM-DD') + " " + course_topic_time_bhour, /*授课时间*/ 
             course_topic_etime: that_day.format('YYYY-MM-DD') + " " + course_topic_time_ehour, /*授课结束时间*/
          });
        }
      }
    }
    return this.success(values);
  }

  async deleteAction() {
    const id = this.post('id');
    let model = this.model('course_topic');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('course_topic');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

