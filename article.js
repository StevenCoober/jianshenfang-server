const Base = require('./base.js');

module.exports = class extends Base {
  //  article(jianshenfang_article) = {
  //    id:int, /*健身房文章id*/ 
  //    title:varchar, /*健身房文章标题*/ 
  //    article_type:varchar, /*文章所属种类*/ 
  //    view_count:int, /*浏览量*/ 
  //    detail:text, /*健身房文章内容*/ 
  //    article_img:varchar, /*健身房文章缩略图*/ 
  //    add_time:datetime, /*添加时间*/ 
  //    modify_time:datetime, /*修改时间*/ 
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

    const model = this.model('article');
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
    const model = this.model('article');
    const data = await model.where({is_delete:0}).select();
    
    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('article');
    const data = await model.where({id: id, is_delete:0}).find();

    return this.success(data);
  }

  async infosAction() {
    const id = this.post('id');
    const key = this.post('key');
    const name = this.post('name');

    if (key == null) return this.fail(401, '数据错误');
    if (name == null) return this.fail(401, '数据错误');

    const model = this.model('article');
    data = await model.where({[`${key}`]: `${name}`, is_delete: 0}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('article');
    if (id > 0) {
      values.modify_time = think.datetime(Date.now());
      await model.where({id: id, is_delete: 0}).update(values);
    } else {
      delete values.id;
      values.add_time = values.modify_time = think.datetime(Date.now());
      await model.add(values);
    }
    return this.success(values);
  }

  async deleteAction() {
    const id = this.post('id');
    let model = this.model('article');
    await model.where({id: id}).limit(1).update({is_delete: 1});
    return this.success();
  }

  async destoryAction() {
    const id = this.post('id');
    let model = this.model('article');
    await model.where({id: id}).limit(1).delete();
    // TODO 
    return this.success();
  }
};

